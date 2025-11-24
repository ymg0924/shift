////////////////////////////////////////
// 우클릭 메뉴 작업 중
////////////////////////////////////////

import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Form,
  Button,
  ListGroup,
  Navbar,
  InputGroup,
} from "react-bootstrap";
import { BsSearch, BsPlusLg } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { StompContext } from "../../api/StompProvider";
import ChatRoomListContextMenu from "../../components/chat/ChatRoomListContextMenu";

const ChatRoomList = () => {
    const { stompReady } = useContext(StompContext);
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);  // 채팅방 목록
    const [searchKeyword, setSearchKeyword] = useState("");  // 검색어
    const menuRef = useRef(null); // 우클릭 메뉴 참조

    // 채팅방 목록 가져오기
    const getChatRoomList = async (userId) => {
        try {
            const userChatRoomInfo = await axios.get(`http://localhost:8080/chatrooms/users/${userId}`);
            setRooms(userChatRoomInfo.data);
            console.log("채팅방 목록 호출 " ,userChatRoomInfo.data);

        } catch (err) {
            console.error(err);
        }
    }

    // 마지막 채팅 날짜 포맷팅 함수
    const formatLastChatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        // 오늘 0시 기준
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // 날짜만 비교용
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // 1) 오늘이면 "오전/오후 HH:mm"
        if (target.getTime() === today.getTime()) {
            const hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, "0");

            const ampm = hours < 12 ? "오전" : "오후";
            const displayHour = hours % 12 === 0 ? 12 : hours % 12;

            return `${ampm} ${displayHour}:${minutes}`;
        }

        // 2) 어제면 "어제"
        if (target.getTime() === yesterday.getTime()) {
            return "어제";
        }

        // 3) 올해면 "MM월 DD일"
        if (date.getFullYear() === now.getFullYear()) {
            return `${date.getMonth() + 1}월 ${date.getDate()}일`;
        }

        // 4) 올해가 아니면 "YYYY. M. D."
        return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
    };

    // 채팅방 검색 시 필터링 된 방 목록
    const filteredRooms = rooms.filter(room =>
        room.chatroomName.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const accessToken = useSelector((state) => state.auth.accessToken);
    // 페이지 진입 시 실행
    useEffect(() => {
        if (!stompReady) return; // 연결 체크
        if (!accessToken) return; // 토큰 유무 체크

        const userId = accessToken ? jwtDecode(accessToken).sub : null;

        getChatRoomList(userId);
    }, []);

    return (
        <Container
        fluid
        className="p-0 bg-white mx-auto border-start border-end d-flex flex-column"
        style={{ maxWidth: "480px", height: "100vh", overflow: "hidden" }}
        >
        <ChatRoomListContextMenu rooms={rooms} setRooms={setRooms} ref={menuRef} />
        {/* Header */}
        <Navbar bg="light" className="border-bottom px-4 py-3">
            <Navbar.Brand className="fw-bold">채팅목록</Navbar.Brand>

            <Button variant="light" className="ms-auto">
            <BsPlusLg size={20} />
            </Button>
        </Navbar>

        {/* Search Section */}
        <div className="border-bottom p-4">
            <InputGroup>
            <InputGroup.Text>
                <BsSearch />
            </InputGroup.Text>
            <Form.Control
                placeholder="채팅방 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
            />
            </InputGroup>
        </div>

        {/* Chat List */}
        <div className="flex-grow-1 overflow-auto" style={{ paddingBottom: "80px" }}>
            <ListGroup variant="flush">
            {filteredRooms.map((room) => (
                <ListGroup.Item
                key={room.chatroomId}
                action
                onContextMenu={(e) => menuRef.current?.openContextMenu(e, room)}
                onClick={() => navigate(`/chatroom/${room.chatroomId}`, { state: { room } })}
                className="d-flex align-items-center gap-3 border-bottom py-3"
                style={{ cursor: "pointer" }}
                >
                {/* Avatar */}
                <div
                    style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    }}
                >
                    <span className="fw-bold">{room.chatroomName[0]}</span>
                </div>

                {/* Chat Info */}
                <div className="flex-grow-1 text-start">
                    <div className="d-flex justify-content-between">
                    <span className="fw-semibold">{room.chatroomName}</span>
                    {room.lastMsgDate && (
                        <span className="text-muted small">{formatLastChatDate(room.lastMsgDate)}</span>
                    )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                    {room.lastMsgContent ? (
                        <div className="text-muted text-truncate small" style={{ maxWidth: "70%" }}>
                            {room.lastMsgContent.length > 20  // 20자 이상이면 말줄임표
                              ? room.lastMsgContent.slice(0, 17) + "..."
                              : room.lastMsgContent}
                        </div>
                    ) : (
                        <div style={{ maxWidth: "70%" }}></div>
                    )}

                    {/* 안읽은 메시지 수 */}
                    {room.unreadCount > 0 && (
                    <span
                        className="small px-3 py-1 rounded-pill border"
                        style={{
                        borderColor: "red",
                        color: "white",
                        backgroundColor: "red",
                        whiteSpace: "nowrap",
                        }}
                    >
                        {room.unreadCount}
                    </span>
                    )}
                    </div>
                </div>

                </ListGroup.Item>
            ))}
            </ListGroup>
        </div>

        {/* Bottom Navigation (Placeholder) */}
            <div className="border-top p-3 d-flex justify-content-around">
                <Button
                variant="link"
                className="text-secondary text-decoration-none"
                onClick={() => navigate("/friends")}
                >
                친구
                </Button>
                <Button
                variant="link"
                className="text-dark fw-bold text-decoration-none"
                >
                채팅
                </Button>
                <Button
                variant="link"
                className="text-secondary text-decoration-none"
                onClick={() => navigate("/mypage")}
                >
                MY
                </Button>
            </div>
        </Container>
    );
};

export default ChatRoomList;
