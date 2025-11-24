////////////////////////////////////////
// 작업 중
////////////////////////////////////////

import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Navbar,
  Button,
  ListGroup,
  InputGroup,
  Form,
} from "react-bootstrap";

import { BsXLg, BsFillSendFill } from "react-icons/bs";

import { StompContext } from "../../api/StompProvider";
import axios from "axios";

const NewChatRoom = ({ token }) => {
  const { stompClient, stompReady } = useContext(StompContext);

  const navigate = useNavigate();
  const location = useLocation();

  const friend = location.state?.friend;
  const initialRoomName = location.state?.roomName;

  const [messages, setMessages] = useState([]);
  const [chatroomId, setChatroomId] = useState(null); // 최초에는 null
  const [inputText, setInputText] = useState("");

  // 페이지 잘못 들어왔을 때
  if (!friend || !initialRoomName) {
    return (
      <Container className="p-5 text-center">
        잘못된 접근입니다.
      </Container>
    );
  }

  // 첫 메시지를 보낼 때 새로운 채팅방 생성 & 구독 시작
  const sendFirstMessage = async () => {
    try {
      const dto = {
        messageDTO: {
          userId: token,
          content: inputText,
        },
        chatroomUserDTO: {
          friendId: friend.friendId,
          chatroomName: initialRoomName,
        },
      };

      // 새 채팅방을 생성 + 메시지 저장 + 방 ID 반환
      const response = await axios.post(
        "http://localhost:8080/messages/new-room",
        dto
      );

      const newRoomId = response.data.chatroomId;

      console.log("새 채팅방 생성됨:", newRoomId);
      setChatroomId(newRoomId);

      // STOMP 구독 시작
      stompClient.subscribe(`/sub/messages/${newRoomId}`, (message) => {
        const received = JSON.parse(message.body);
        setMessages((prev) => [...prev, received]);
      });

      // 첫 메시지는 이미 보냈으므로 추가
      setMessages((prev) => [
        ...prev,
        {
          messageId: "first",
          content: inputText,
          userId: token,
          sendDate: new Date().toISOString(),
        },
      ]);

      setInputText("");

    } catch (error) {
      console.error("새 채팅방 생성 실패:", error);
      alert("채팅방 생성 중 오류.");
    }
  };

  // 이후 메시지 전송
  const sendMessage = () => {
    if (!chatroomId) return; // 방이 아직 생성되지 않은 경우 첫 메시지 처리됨

    const dto = {
      messageDTO: {
        userId: token,
        content: inputText,
      },
      chatroomUserDTO: {
        chatroomId: chatroomId,
      },
    };

    stompClient.publish({
      destination: `/pub/messages/send`,
      body: JSON.stringify(dto),
    });

    setInputText("");
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    if (!chatroomId) {
      sendFirstMessage();
    } else {
      sendMessage();
    }
  };

  return (
    <Container
      fluid
      className="p-0 d-flex flex-column bg-white mx-auto border-start border-end"
      style={{ maxWidth: "480px", height: "100vh" }}
    >
      {/* Header */}
      <Navbar bg="light" className="px-3 border-bottom d-flex justify-content-between">
        <Navbar.Brand className="m-0">
          {initialRoomName}
        </Navbar.Brand>
        <Button variant="light" onClick={() => navigate("/chatroom/list")}>
          <BsXLg />
        </Button>
      </Navbar>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3" style={{ background: "#f7f7f7" }}>
        <ListGroup variant="flush">
          {messages.map((msg) => (
            <ListGroup.Item
              key={msg.messageId}
              className="border-0 d-flex mb-2 px-0"
              style={{
                justifyContent: msg.userId === token ? "flex-end" : "flex-start",
                background: "transparent",
              }}
            >
              <div style={{ maxWidth: "75%" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px",
                    backgroundColor: msg.userId === token ? "black" : "white",
                    color: msg.userId === token ? "white" : "black",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Input */}
      <div className="border-top bg-white p-3">
        <InputGroup>
          <Form.Control
            placeholder="메세지를 입력하세요"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <Button variant="dark" onClick={handleSend}>
            <BsFillSendFill />
          </Button>
        </InputGroup>
      </div>
    </Container>
  );
};

export default NewChatRoom;
