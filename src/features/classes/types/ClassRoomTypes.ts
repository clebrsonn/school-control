export interface ClassRoomRequest {
  name: string;
  schoolYear: string;
  startTime: string;
  endTime: string;

}

export interface ClassRoomResponse extends ClassRoomRequest{
  id: string;
}