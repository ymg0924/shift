import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Navbar,
  ListGroup,
  Button,
  InputGroup,
  Form,
  Card,
} from "react-bootstrap";

import {
  BsFillSendFill,
  BsPlusLg,
  BsXLg,
  BsEmojiSmile,
} from "react-icons/bs";

import "../../styles/ChatRoom.css";
import { StompContext } from "../../api/StompProvider";
import { setCurrentRoomId } from "../../store/chatSlice";

const ChatRoom = ({ onViewGift }) => {
  const { stompClient, stompReady } = useContext(StompContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 전달된 room 객체 정보
  const roomData = location.state?.room;

  // 현재 방에서 수신한 채팅 메시지 배열
  const [receivedMessages, setReceivedMessages] = useState([]);
  // 입력 중인 채팅 메시지
  const [inputMessage, setInputMessage] = useState("");
  // 자동 스크롤 참조
  const bottomScrollRef = useRef(null);

  const [showEmoticons, setShowEmoticons] = useState(false);
  const [showPlusPanel, setShowPlusPanel] = useState(false);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const userId = accessToken ? Number(jwtDecode(accessToken).sub) : null;

  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크

    console.log("사용자 ID:", userId);

    // 새 채팅방 구독 (추후에 로그인 시 바로 자신이 속한 채팅방 전체 구독으로 코드 이동 예정)
    const chatSub = stompClient.subscribe(`/sub/messages/${roomData.chatroomId}`, (message) => {
      const received = JSON.parse(message.body);

      console.log("메시지 타입:", received.type);
      // 자신의 입장 메시지가 수신되면 채팅내역 불러오기
      if (received.type === "JOIN" && received.userId === userId) {
        loadHistory();
      }

      // 입장,퇴장 메시지 출력 X
      if (received.type === "JOIN" || received.type === "LEAVE") return;

      setReceivedMessages((prev) => [...prev, received]);
    });

    // 입장 메시지 전송
    const joinMessage = {
      messageDTO: {
        type: "JOIN",
        chatroomId : roomData.chatroomId,
        userId: userId,
        sendDate: new Date(),
        content: `${userId}님이 입장했습니다.`,
        isGift: "N",
        unreadCount: 1,
      },
      chatroomUserDTO: {
        chatroomUserId: roomData.chatroomUsersId,
        chatroomId: roomData.chatroomId,
        userId: userId,
        chatroomName: roomData.chatroomName,
        lastConnectionTime: roomData.lastConnectionTime,
        createdTime: roomData.createdTime,
        connectionStatus: roomData.connectionStatus,
        isDarkMode: roomData.isDarkMode
      }
    };
    console.log("입장 메시지 전송");
    stompClient.publish({
      destination: `/pub/send`,
      body: JSON.stringify(joinMessage),
    });

    // 채팅내역 불러옴
    // (async () => {
    //   console.log("채팅내역 요청 시작");
    //   try {
    //     const response = await axios.post("http://localhost:8080/messages/history", roomData);
    //     console.log("응답 데이터:", response.data);

    //     // Date순 정렬
    //     const sortedMessages = response.data.sort(
    //       (a, b) => new Date(a.sendDate) - new Date(b.sendDate)
    //     );

    //     // 채팅내역 세팅
    //     setReceivedMessages(sortedMessages);
    //     //setIsChatHistoryLoaded(true);
        
    //   } catch (error) {
    //     console.error("채팅기록 불러오기 실패:", error);
    //     //alert("채팅기록을 불러올 수 없습니다.");
    //   }
    // })();

    // 언마운트 시 구독 해제 (추후 로그아웃 또는 연결 끊기면 구독해제 되도록 코드 이동 예정)
    return () => {
      chatSub && chatSub.unsubscribe();

      const leaveMessage = { 
        messageDTO: {
          type: "LEAVE",
          chatroomId : roomData.chatroomId,
          userId: userId,
          sendDate: new Date(),
          content: `${userId}님이 퇴장했습니다.`,
          isGift: "N",
          unreadCount: 1,
        },
        chatroomUserDTO: {
          chatroomUserId: roomData.chatroomUsersId,
          chatroomId: roomData.chatroomId,
          userId: userId,
          chatroomName: roomData.chatroomName,
          lastConnectionTime: roomData.lastConnectionTime,
          createdTime: roomData.createdTime,
          connectionStatus: roomData.connectionStatus,
          isDarkMode: roomData.isDarkMode
        }
      };
      if (stompReady) { // 연결 여부 다시 체크
        stompClient.publish({
          destination: `/pub/send`,
          body: JSON.stringify(leaveMessage),
        });
      }
    };
  }, []);

  const loadHistory = async () => {
    console.log("채팅내역 요청 시작");
    try {
      const response = await axios.post("http://localhost:8080/messages/history", roomData);
      console.log("응답 데이터:", response.data);

      // Date순 정렬
      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.sendDate) - new Date(b.sendDate)
      );

      // 채팅내역 세팅
      setReceivedMessages(sortedMessages);
      //setIsChatHistoryLoaded(true);
      
    } catch (error) {
      console.error("채팅기록 불러오기 실패:", error);
      //alert("채팅기록을 불러올 수 없습니다.");
    }
  };


  const sendMessage = () => {
    console.log("Sending message:", inputMessage);
    if (!stompReady) return; // 연결 체크
    if (!userId) return; // 토큰 유무 체크

    if (inputMessage.trim()) {
      console.log("roomId = ", roomData.chatroomId);
      const msg = { 
        messageDTO: {
          type: "CHAT",
          chatroomId : roomData.chatroomId,
          userId: userId,
          sendDate: new Date(),
          content: inputMessage,
          isGift: "N",
          unreadCount: 1,
        },
        chatroomUserDTO: {
          chatroomUserId: roomData.chatroomUsersId,
          chatroomId: roomData.chatroomId,
          userId: userId,
          chatroomName: roomData.chatroomName,
          lastConnectionTime: roomData.lastConnectionTime,
          createdTime: roomData.createdTime,
          connectionStatus: roomData.connectionStatus,
          isDarkMode: roomData.isDarkMode
        }
      };
      stompClient.publish({
        destination: `/pub/send`,
        body: JSON.stringify(msg),
      });
      setInputMessage(""); // 입력창 초기화
    }
  };

  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [receivedMessages]);

  const emoticons = ["😊", "😂", "❤️", "👍", "😢", "😮", "🎉", "🎁"];

  const handlePlusClick = () => {
    setShowPlusPanel(!showPlusPanel);
    setShowEmoticons(false);
  };

  const handleSmileClick = () => {
    setShowEmoticons(!showEmoticons);
    setShowPlusPanel(false);
  };

  const handleEmoticonSelect = (emo) => {
    console.log("Selected emoticon:", emo);
    setShowEmoticons(false);
  };

  // 메시지 전송시간 포맷팅 함수
  function formatMessageDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours < 12 ? "오전" : "오후";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    // 오늘 날짜 비교용 (시/분/초 제외)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(year, date.getMonth(), day);

    // 1) 오늘이면 오전/오후 HH:mm
    if (today.getTime() === target.getTime()) {
      return `${ampm} ${displayHour}:${minutes}`;
    }

    // 2) 올해이면 M월 D일 오전/오후 HH:mm
    if (year === now.getFullYear()) {
      return `${month}월 ${day}일 ${ampm} ${displayHour}:${minutes}`;
    }

    // 3) 올해가 아니면 YYYY년 M월 D일 오전/오후 HH:mm
    return `${year}년 ${month}월 ${day}일 ${ampm} ${displayHour}:${minutes}`;
  }

  return (
    <Container
      fluid
      className="p-0 d-flex flex-column bg-white mx-auto border-start border-end"
      style={{ maxWidth: "480px", height: "100vh", overflow: "hidden" }}
    >
      {/* Header */}
      <Navbar
        bg="light"
        className="px-3 border-bottom d-flex align-items-center justify-content-between"
      >
        <Navbar.Brand className="m-0">{roomData.chatroomName}</Navbar.Brand>

        <Button variant="light" onClick={() => navigate("/chatroom/list")}>
          <BsXLg />
        </Button>
      </Navbar>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto p-3 no-scrollbar"
        style={{ background: "#f7f7f7" }}
      >
        <ListGroup variant="flush">
          {receivedMessages.map((msg) => {
            if (msg.isGift === "Y") {
              return (
                <div key={msg.messageId} className="d-flex justify-content-center mb-3">
                  <Card
                    style={{
                      maxWidth: "260px",
                      border: "2px solid #ddd",
                      borderRadius: "10px",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <p className="small text-muted mb-2">
                      {msg.content}
                    </p>

                    <Button
                      variant="dark"
                      onClick={onViewGift}
                      className="w-100"
                    >
                      선물함
                    </Button>

                    <p className="text-muted small mt-2">{formatMessageDate(msg.sendDate)}</p>
                  </Card>
                </div>
              );
            }

            return (
              <ListGroup.Item
                key={msg.messageId}
                className="border-0 d-flex mb-2 px-0"
                style={{
                  justifyContent: msg.userId === userId ? "flex-end" : "flex-start",
                  background: "transparent",
                }}
              >
                <div style={{ maxWidth: "75%" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "16px",
                      backgroundColor:
                        msg.userId === userId ? "black" : "white",
                      color: msg.userId === userId ? "white" : "black",
                      border: msg.userId === userId ? "2px solid #ddd" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                  <div 
                    className="text-muted small mt-1"
                    style={{
                      display: "flex",
                      justifyContent: msg.userId === userId ? "flex-end" : "flex-start",
                    }}
                  >
                    {formatMessageDate(msg.sendDate)}
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
          <div ref={bottomScrollRef}></div>
        </ListGroup>
      </div>

      {/* Plus Panel */}
      {showPlusPanel && (
        <div className="border-top bg-white p-3">
          <Row>
            <Col>
              <Button
                variant="light"
                className="w-100 py-4 border border-dark"
                onClick={() => {
                  dispatch(setCurrentRoomId(roomData.chatroomId));
                  navigate("/shop");
                }}
              >
                상품 선물
              </Button>
            </Col>
            <Col>
              <Button
                variant="light"
                className="w-100 py-4 border border-dark"
              >
                금액권 선물
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Emoticon Panel */}
      {showEmoticons && (
        <div className="border-top bg-white p-3">
          <Row>
            {emoticons.map((emo, idx) => (
              <Col xs={3} key={idx} className="p-2 text-center">
                <Button
                  variant="light"
                  className="w-100 p-3 border"
                  onClick={() => handleEmoticonSelect(emo)}
                >
                  <span style={{ fontSize: "24px" }}>{emo}</span>
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Input */}
      <div className="border-top bg-white p-3">
        <InputGroup>
          <Button variant="outline-secondary" onClick={handlePlusClick}>
            <BsPlusLg />
          </Button>

          <Button variant="outline-secondary" onClick={handleSmileClick}>
            <BsEmojiSmile />
          </Button>

          <Form.Control
            placeholder="텍스트를 입력하세요"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!e.shiftKey) {
                  e.preventDefault(); // 줄바꿈 방지
                  sendMessage();
                }
              }
            }}
          />

          <Button variant="dark" onClick={sendMessage}>
            <BsFillSendFill />
          </Button>
        </InputGroup>
      </div>
    </Container>
  );
};

export default ChatRoom;
