import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Button,
  InputGroup,
  Form,
} from "react-bootstrap";

import {
  BsFillSendFill,
  BsPlusLg,
  BsGift,
  BsXLg,
  BsEmojiSmile,
} from "react-icons/bs";

import "../../styles/chat/ChatRoom.css";
import { StompContext } from "../../api/StompProvider";
import httpClient from '../../api/httpClient';
import { setCurrentRoomId } from "../../store/chatSlice";
import MessageWrapper from "../../components/chat/MessageWrapper";
import GiftMessageWrapper from "../../components/chat/GiftMessageWrapper";
import MessengerSidebar from "../../components/chat/MessengerSidebar";
import { ChatRoomListContent } from "./ChatRoomList";
import "../../styles/chat/MessengerLayout.css";
import "../../styles/chat/ChatTheme.css";

const ChatRoom = ({ onViewGift }) => {
  const { stompClient, stompReady } = useContext(StompContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 전달된 room 객체 정보
  const roomData = location.state?.room;
  const [roomInfo, setRoomInfo] = useState(roomData);
  const [chatroomName, setChatroomName] = useState(roomData?.chatroomName || "");

  // =====================================================================
  // ★ 수정 1 — receiverId / receiverName을 확실하게 계산
  // =====================================================================
  const receiverId = roomInfo?.receiverId ?? null;
  const receiverName = roomInfo?.receiverName ?? null;

  // =====================================================================

  // 현재 방에서 수신한 채팅 메시지 배열
  const [receivedMessages, setReceivedMessages] = useState([]);
  // 입력 중인 채팅 메시지
  const [inputMessage, setInputMessage] = useState("");
  // 자동 스크롤 참조
  const bottomScrollRef = useRef(null);
  // 채팅방 삭제 시 퇴장 메시지 전송 방지용 플래그
  const skipLeaveRef = useRef(false);

  const [showEmoticons, setShowEmoticons] = useState(false);
  const [showPlusPanel, setShowPlusPanel] = useState(false);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const userId = accessToken ? Number(jwtDecode(accessToken).sub) : null;
  const username = accessToken ? jwtDecode(accessToken).name : null;

  // 현재 열람 중인 방 ID를 전역 상태로 기록
  useEffect(() => {
    if (!roomInfo?.chatroomId) return;

    dispatch(setCurrentRoomId(roomInfo.chatroomId));

    return () => {
      const isGiftFlowFromChat =
        typeof window !== "undefined" && window.SHIFT_GIFT_FROM_CHAT;

      if (!isGiftFlowFromChat) dispatch(setCurrentRoomId(null));
    };
  }, [dispatch, roomInfo?.chatroomId]);

  // roomData 변경 시 roomInfo 갱신
  useEffect(() => {
    setRoomInfo(roomData);
    setChatroomName(roomData?.chatroomName || "");
  }, [roomData]);

  // 채팅방 정보 갱신 함수
  const fetchChatroomInfo = useCallback(async (targetUserId) => {
    if (!targetUserId) return;

    try {
      const res = await httpClient.get(
        `${process.env.REACT_APP_SERVER_URL}/chatroom/users/${Number(targetUserId)}`
      );
      setRoomInfo(res.data);
      setChatroomName(res.data.chatroomName);
    } catch (error) {
      console.error("채팅방 정보 갱신 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchChatroomInfo(roomInfo?.chatroomUserId);
  }, [fetchChatroomInfo, roomInfo?.chatroomUserId]);

  // 채팅방 정보 갱신 이벤트 리스너
  useEffect(() => {
    if (!roomInfo?.chatroomId) return;

    const handleChatroomUpdated = async (event) => {
      const { chatroomId, chatroomUserId } = event.detail || {};
      if (chatroomId !== roomInfo.chatroomId) return;

      const targetUserId = chatroomUserId ?? roomInfo.chatroomUserId;
      fetchChatroomInfo(targetUserId);
    };

    window.addEventListener("CHATROOM_UPDATED", handleChatroomUpdated);

    return () => {
      window.removeEventListener("CHATROOM_UPDATED", handleChatroomUpdated);
    };
  }, [fetchChatroomInfo, roomInfo?.chatroomId, roomInfo?.chatroomUserId]);

  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크
    if (!roomInfo?.chatroomId) return; // 유효한 채팅방 여부 체크

    // 채팅방 전환 시 기존 메시지 초기화
    setReceivedMessages([]);

    console.log("사용자 ID:", userId);
    console.log("상대방 ID:", receiverId);

    // 채팅방 구독
    const chatSub = stompClient.subscribe(
      `/sub/messages/${roomInfo.chatroomId}`,
      (message) => {
        const received = JSON.parse(message.body);

        console.log("메시지 타입:", received.type);
        // 자신의 입장 메시지가 수신되면 채팅내역 불러오기
        if (received.type === "JOIN" && received.userId === userId) {
          loadHistory();
          return;
        }

        // 상대방이 입장한 경우 → unreadCount > 0 인 메시지들의 unreadCount를 전부 -1
        if (received.type === "JOIN" && received.userId !== userId) {
          setReceivedMessages(prev =>
            prev.map(msg => ({
              ...msg,
              unreadCount: msg.unreadCount > 0 ? msg.unreadCount - 1 : 0
            }))
          );
          return;
        }

        // 입장,퇴장 메시지 출력 X
        if (received.type === "JOIN" || received.type === "LEAVE") return;

        setReceivedMessages((prev) => [...prev, received]);

        // 내가 보낸 메시지는 서버가 전역 알림을 쏘지 않기 때문에
        // 직접 채팅방 목록 갱신 이벤트를 발생시켜 최신 메시지/시간을 반영한다.
        if (received.userId === userId) {
          window.dispatchEvent(
            new CustomEvent("CHATROOM_UPDATED", {
              detail: {
                chatroomId: roomInfo.chatroomId,
                chatroomUserId: roomInfo.chatroomUserId,
              },
            })
          );
        }
      }
    );

    // 입장 메시지 송신
    const joinMessage = {
      messageDTO: {
        type: "JOIN",
        chatroomId: roomInfo.chatroomId,
        userId: userId,
        sendDate: new Date(),
        content: `${userId}님이 입장했습니다.`,
        isGift: "N",
        unreadCount: 1,
      },
      chatroomUserDTO: {
        chatroomUserId: roomInfo.chatroomUserId,
        chatroomId: roomInfo.chatroomId,
        userId: userId,
        chatroomName: chatroomName || roomInfo.chatroomName,
        lastConnectionTime: roomInfo.lastConnectionTime,
        createdTime: roomInfo.createdTime,
        connectionStatus: roomInfo.connectionStatus,
        isDarkMode: roomInfo.isDarkMode,
      },
    };

    console.log("입장 메시지 전송");

    stompClient.publish({
      destination: `/pub/send`,
      body: JSON.stringify(joinMessage),
    });

    const sendLeaveMessage = () => {
      // 채팅방 삭제로 나가는 경우에는 LEAVE 전송 금지
      if (skipLeaveRef.current) return;

      console.log("퇴장 chatroomUsersId:", roomInfo.chatroomUserId);

      const leaveMessage = {
        messageDTO: {
          type: "LEAVE",
          chatroomId: roomInfo.chatroomId,
          userId: userId,
          sendDate: new Date(),
          content: `${userId}님이 퇴장했습니다.`,
          isGift: "N",
          unreadCount: 1,
        },
        chatroomUserDTO: {
          chatroomUserId: roomInfo.chatroomUserId,
          chatroomId: roomInfo.chatroomId,
          userId: userId,
          chatroomName: chatroomName || roomInfo.chatroomName,
          lastConnectionTime: roomInfo.lastConnectionTime,
          createdTime: roomInfo.createdTime,
          connectionStatus: roomInfo.connectionStatus,
          isDarkMode: roomInfo.isDarkMode,
        },
      };

      if (stompReady) { // 연결 여부 다시 체크
        stompClient.publish({
          destination: `/pub/send`,
          body: JSON.stringify(leaveMessage),
        });
      }
    };

    const handleBeforeUnload = () => {
      // 채팅방 삭제로 나가는 경우에는 LEAVE 전송 금지
      if (skipLeaveRef.current) return;
      sendLeaveMessage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 언마운트 시 구독 해제
    return () => {
      chatSub && chatSub.unsubscribe();

      window.removeEventListener("beforeunload", handleBeforeUnload);

      console.log("퇴장 chatroomUsersId:", roomInfo.chatroomUserId);

      sendLeaveMessage();
    };
  }, [stompReady, accessToken, roomInfo?.chatroomId]);

  // 채팅방 삭제 이벤트 리스너
  useEffect(() => {
    const handleChatroomDeleted = (event) => {
      const { chatroomId } = event.detail || {};
      if (!chatroomId) return;

      // 현재 보고 있는 방이 삭제된 경우에만 처리
      if (Number(chatroomId) !== Number(roomInfo?.chatroomId)) return;

      // 이 플래그가 true면 cleanup/beforeunload에서 LEAVE 안 보냄
      skipLeaveRef.current = true;

      navigate("/chatroom/list");
    };

    window.addEventListener("CHATROOM_DELETED", handleChatroomDeleted);
    return () => window.removeEventListener("CHATROOM_DELETED", handleChatroomDeleted);
  }, [navigate, roomInfo?.chatroomId]);

  // 채팅내역 로딩이 끝나기 전까지 목록 fetch를 막기 위한 상태
  const [suspendListFetch, setSuspendListFetch] = useState(true);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // 방이 바뀌면 다시 잠그기
  useEffect(() => {
    if (!roomInfo?.chatroomId) return;
    setSuspendListFetch(true);
  }, [roomInfo?.chatroomId]);

  const loadHistory = async () => {
    console.log("채팅내역 요청 시작");
    try {
      const response = await httpClient.post(
        `${process.env.REACT_APP_SERVER_URL}/messages/history`,
        roomInfo
      );
      console.log("응답 데이터:", response.data);

      // Date순 정렬
      const sortedMessages = response.data.sort(
        (a, b) => new Date(a.sendDate) - new Date(b.sendDate)
      );

      // 채팅내역 세팅
      setReceivedMessages(sortedMessages);

      // 여기서 채팅내역 로딩 완료 -> 목록 fetch 풀고 -> 목록 갱신 트리거
      setSuspendListFetch(false);
      setListRefreshKey((k) => k + 1);

    } catch (error) {
      console.error("채팅기록 불러오기 실패:", error);

      // 실패해도 잠금 풀기
      setSuspendListFetch(false);
      setListRefreshKey((k) => k + 1);
    }
  };

  const sendMessage = () => {
    if (!stompReady) return; // 연결 체크
    if (!userId) return; // 토큰 유무 체크
    console.log("Sending message:", inputMessage);

    if (inputMessage.trim()) {
      console.log("roomId = ", roomInfo.chatroomId);
      const msg = {
        messageDTO: {
          type: "CHAT",
          chatroomId: roomInfo.chatroomId,
          userId: userId,
          sendDate: new Date(),
          content: inputMessage,
          isGift: "N",
          unreadCount: 1,
        },
        chatroomUserDTO: {
          chatroomUserId: roomInfo.chatroomUserId,
          chatroomId: roomInfo.chatroomId,
          userId: userId,
          chatroomName: chatroomName || roomInfo.chatroomName,
          lastConnectionTime: roomInfo.lastConnectionTime,
          createdTime: roomInfo.createdTime,
          connectionStatus: roomInfo.connectionStatus,
          isDarkMode: roomInfo.isDarkMode,
        },
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
    <div className="messenger-layout  messenger-theme">
      <MessengerSidebar active="chat" />

      <div className="messenger-column list-column">
        <ChatRoomListContent
          embedded
          suspendFetch={suspendListFetch}
          refreshKey={listRefreshKey}
        />
      </div>

      <div className="messenger-column detail-column">
        <Container fluid className="p-0 d-flex flex-column h-100 messenger-theme">
          <div className="messenger-header w-100">
            <h2 className="messenger-title mb-0">{chatroomName || roomInfo?.chatroomName}</h2>

            <Button variant="light" className="ms-auto theme-icon-button" onClick={() => navigate("/chatroom/list")}>
              <BsXLg />
            </Button>
          </div>

          <div
            className="flex-grow-1 overflow-auto p-3 no-scrollbar"
            style={{ background: "#f7f7f7" }}
          >
            <ListGroup variant="flush">
              {receivedMessages.map((msg, index) => {
                const previousMessage = receivedMessages[index - 1];
                const isSameSender = previousMessage?.userId === msg.userId;
                const displayName = msg.userId === userId ? username : receiverName;

                return (
                  <ListGroup.Item key={msg.messageId} className="border-0 px-0 bg-transparent">
                  {msg.isGift === "Y" ? (
                    <GiftMessageWrapper
                      msg={msg}
                      userId={userId}
                      onViewGift={onViewGift}
                      time={formatMessageDate(msg.sendDate)}
                      showSender={!isSameSender}
                      displayName={displayName}
                    />
                  ) : (
                    <MessageWrapper
                      msg={msg}
                      userId={userId}
                      time={formatMessageDate(msg.sendDate)}
                      showSender={!isSameSender}
                      displayName={displayName}
                    />
                  )}
                  </ListGroup.Item>
                );
              })}
              <div ref={bottomScrollRef}></div>
            </ListGroup>
          </div>

          {showPlusPanel && (
            <div className="border-top bg-white p-3 section-accent">
              <Row>
                <Col>
                  <Button
                    variant="light"
                    className="w-100 py-4 outline-pill-btn"
                    onClick={() => {
                      window.SHIFT_RECEIVER_ID = receiverId;
                      window.SHIFT_RECEIVER_NAME = receiverName;
                      window.SHIFT_GIFT_FROM_CHAT = true;
                      window.SHIFT_GIFT_FROM_FRIEND = false;

                      dispatch(setCurrentRoomId(roomInfo.chatroomId));

                      navigate("/shop", {
                        state: {
                          isGift: true,
                          receiverId,
                          receiverName,
                        },
                      });
                    }}
                  >
                    상품 선물
                  </Button>
                </Col>

                <Col>
                  <Button
                    variant="light"
                    className="w-100 py-4 outline-pill-btn"
                    onClick={() => {
                      window.SHIFT_RECEIVER_ID = receiverId;
                      window.SHIFT_RECEIVER_NAME = receiverName;
                      window.SHIFT_GIFT_FROM_CHAT = true;
                      window.SHIFT_GIFT_FROM_FRIEND = false;

                      dispatch(setCurrentRoomId(roomInfo.chatroomId));

                      navigate("/gift-card", {
                        state: {
                          isGift: true,
                          isVoucherOrder: true,
                          receiverId,
                          receiverName,
                        },
                      });
                    }}
                  >
                    금액권 선물
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          {showEmoticons && (
            <div className="border-top bg-white p-3 section-accent">
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

          <div className="border-top bg-white p-3 section-accent">
            <InputGroup>
              <Button variant="light" className="outline-pill-btn" onClick={handlePlusClick}>
                <BsGift />
              </Button>

              <Button variant="light" className="outline-pill-btn" onClick={handleSmileClick}>
                <BsEmojiSmile />
              </Button>

              <Form.Control
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }
                  }}
              />

              <Button variant="primary" className="primary-pill-btn" onClick={sendMessage}>
                <BsFillSendFill />
              </Button>
            </InputGroup>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ChatRoom;
