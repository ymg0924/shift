import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    userInfo: null, // 로그인한 사용자 정보
    rooms: [], // 채팅방 목록
    currentRoomId: null, // 현재 선택된 방 ID
    messages: [], // 현재 방의 메시지들
    usersInRoom: [], // 현재 방 접속자 목록
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setCurrentRoomId: (state, action) => {
      state.currentRoomId = action.payload;
      state.messages = []; // 방 변경 시 메시지 초기화
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setUsersInRoom: (state, action) => {
      state.usersInRoom = action.payload;
    },
  },
});

export const {
  setUserInfo,
  setRooms,
  setCurrentRoomId,
  addMessage,
  setMessages,
  setUsersInRoom,
} = chatSlice.actions;
export default chatSlice.reducer;
