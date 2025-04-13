import { BaseService } from './generics/BaseService';
import mongoose from 'mongoose';
import { EnrollmentService } from './EnrollmentService';
import {IEnrollment, IStudent, ITuition, Tuition } from '@hyteck/shared';

export class PaymentService extends BaseService<ITuition> {

    constructor() {
        super(Tuition);
        this.populateFields = ['enrollment', 'responsible'];
    }

    private _enrollmentService!: EnrollmentService;

    private get enrollmentService(): EnrollmentService {
        if (!this._enrollmentService) {
            const {EnrollmentService} = require("./EnrollmentService");
            this._enrollmentService = new EnrollmentService();
        }
        return this._enrollmentService;
    }

    getPaymentsByParentId = async (responsible: string) => {
        return Tuition.find({responsible}).populate('enrollment').sort({dueDate: 1});
    };

    // Serviço para gerar mensalidades no início de cada mês
    generateMonthlyTuitions = async () => {
        const activeEnrollments = await this.enrollmentService.findAcitveAndEndDateLessThanToday();
        const currentDate = new Date();

        const tuitions = activeEnrollments.map((enrollment: IEnrollment) => ({
            enrollment: enrollment._id,
            dueDate: Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 10, 0, 0, 0, 0),
            status: "pending",
            paymentDate: Date,
            responsible: enrollment.tuitionAmount,
            amount: (enrollment.student as IStudent).responsible,
        
        }));

        await Tuition.insertMany(tuitions);

    };

    async getMonthlyDebtByParentId(responsible: string) {
        return await Tuition.aggregate([
            {
                $match: {
                    // Filtra pelos pagamentos do responsável
                    responsible: new mongoose.Types.ObjectId(responsible),
                    // dueDate: {
                    //   $gte: firstDayOfMonth, // Pagamentos a partir do primeiro dia do mês
                    //   $lte: lastDayOfMonth,  // Até o último dia do mês
                    // },
                },
            },
            {
                $group: {
                    _id: {
                        month: {$month: "$dueDate"}, // Extrair o mês da data de vencimento
                        year: {$year: "$dueDate"},  // Garantir agrupamento também por ano
                    },
                    totalDebt: {$sum: "$amount"}, // Soma o campo "amount"
                },
            }, {
                $sort: {"_id.year": 1, "_id.month": 1, "_id.amount": 1}, // Ordena por mês e pelo valor de amount
            }

        ]);
    }

    groupPaymentsByMonthAndParent = async () => {
        const payments = await Tuition.aggregate([
            {
                $group: {
                    _id: {
                        month: {$month: "$dueDate"},
                        year: {$year: "$dueDate"},
                        responsible: "$responsible"
                    },
                    totalAmount: {$sum: "$amount"},
                    //totalDiscount: { $sum: "$discount" },
                    payments: {$push: "$$ROOT"}
                }
            },
            {
                $lookup: {
                    from: "responsibles",
                    localField: "_id.responsible",
                    foreignField: "_id",
                    as: "responsible"
                }
            },
            {
                $unwind: "$responsible"
            },
            {
                $sort: {"_id.year": 1, "_id.month": 1}
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    responsible: "$responsible",
                    totalAmount: 1,
                    totalDiscount: 1,
                    payments: 1
                }
            }
        ]);

        return payments;
    };

    getLatePayments = async () => {
        return Tuition.find({
            status: 'pending',
            dueDate: {$gt: new Date()},
            paymentDate: {$exists: false}
        }).populate('responsible').populate('enrollment');
    };

    getLatePaymentsByResponsible = async (responsibleId: string) => {
        return Tuition.find({
            status: 'pending',
            responsible: responsibleId
        }).populate('responsible').populate('enrollment');
    };


    getTotalEstimatedForCurrentMonth = async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const result = await Tuition.aggregate([
            {
                $match: {
                    dueDate: {
                        $gte: firstDayOfMonth,
                        $lte: lastDayOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {$sum: "$amount"}
                }
            }
        ]);

        return result.length > 0 ? result[0].totalAmount : 0;
    };

    getOnTimePayers = async () => {
        return Tuition.aggregate([
            {
                $match: {status: 'paid'
                }
            },
            {
                $group: {
                    _id: "$responsible",
                    count: {$sum: 1}
                }
            },
            {
                $lookup: {
                    from: "responsibles",
                    localField: "_id",
                    foreignField: "_id",
                    as: "responsible"
                }
            },
            {
                $unwind: "$responsible"
            },
            {
                $sort: {count: -1}
            }
        ]);
    };

    getMostLatePayers = async () => {
        return Tuition.aggregate([
            {
                $match: {status: 'late'}
            },
            {
                $group: {
                    _id: "$responsible",
                    count: {$sum: 1}
                }
            },
            {
                $lookup: {
                    from: "responsibles",
                    localField: "_id",
                    foreignField: "_id",
                    as: "responsible"
                }
            },
            {
                $unwind: "$responsible"
            },
            {
                $sort: {count: -1}
            }
        ]);
    };

    fetchPendingPaymentsForCurrentMonth = async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return Tuition.aggregate([
            {
                $match: {
                    status: 'pending',
                    dueDate: {
                        $gte: firstDayOfMonth,
                        $lte: lastDayOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: {$month: "$dueDate"},
                        year: {$year: "$dueDate"},
                        responsible: "$responsible"
                    },
                    totalAmount: {$sum: "$amount"},
                    payments: {$push: "$$ROOT"}
                }
            },
            {
                $lookup: {
                    from: "responsibles",
                    localField: "_id.responsible",
                    foreignField: "_id",
                    as: "responsible"
                }
            },
            {
                $unwind: "$responsible"
            },
            {
                $sort: {"_id.year": 1, "_id.month": 1}
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    responsible: "$responsible",
                    totalAmount: 1,
                    payments: 1
                }
            }
        ]);
    };

}