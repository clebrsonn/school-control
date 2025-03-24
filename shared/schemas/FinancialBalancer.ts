import mongoose from 'mongoose';

const FinancialBalanceSchema = new mongoose.Schema({
    responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Responsible',
        required: true
    },
    month: { type: Date, required: true }, // Ex: 2025-03-01
    totalDue: { type: Number }, // Valor total devido no mês
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number }, // Saldo = totalDue - totalPaid
});

// Middleware para calcular saldo automaticamente
FinancialBalanceSchema.pre('save', function(next: () => void) {
    this.balance = this.totalDue! - this.totalPaid;
    next();
});

export const FinancialBalance = mongoose.model('FinancialBalance', FinancialBalanceSchema);