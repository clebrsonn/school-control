export interface ClassRoomRequest {
  name: string;
  schoolYear: string;
  startTime: string;
  endTime: string;

}

export interface ClassRoomResponse {
  id: string;
  name: string;
  schoolYear: string;
}