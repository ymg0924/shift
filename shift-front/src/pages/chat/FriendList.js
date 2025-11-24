import React, { useState, useEffect, useContext, useRef  } from "react";
import { ListGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import { StompContext } from "../../api/StompProvider";
import httpClient from '../../api/httpClient';
import FriendListContextMenu from "../../components/chat/FriendListContextMenu";

const FriendList = ({onSelectFriend}) => {
  const { stompReady } = useContext(StompContext);
  const navigate = useNavigate();

  const menuRef = useRef(null); // 우클릭 메뉴 참조

  // 친구 정보 리스트
  const [friendInfoList, setFriendInfoList] = useState([]);

  // 친구 목록 가져오기
  const getFriendsList = async (userId) => {
    try {
      const response = await httpClient.get(`http://localhost:8080/friends/users/${userId}`);
      console.log("friendList.data", response.data);
      setFriendInfoList(response.data);

    } catch (err) {
      console.error(err);
    }
  };

  const accessToken = useSelector((state) => state.auth.accessToken);
  // 페이지 진입 시 실행
  useEffect(() => {
    if (!stompReady) return; // 연결 체크
    if (!accessToken) return; // 토큰 유무 체크

    const userId = accessToken ? jwtDecode(accessToken).sub : null;
    console.log("STOMP 연결 완료 → getFriendsList 실행");
    getFriendsList(userId);
  }, [stompReady]);

  return (
    <div
      className="bg-white vh-100 mx-auto border-start border-end d-flex flex-column"
      style={{ maxWidth: "480px" }}
    >
      <FriendListContextMenu ref={menuRef} />
      {/* Header */}
      <div className="px-4 py-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <h2 className="fw-bold m-0">친구목록</h2>
          <div className="d-flex gap-2">
            <Button
              variant="link"
              className="text-secondary text-decoration-none p-0 small"
            >
              편집
            </Button>
            <Button
              variant="link"
              className="text-secondary text-decoration-none p-0 small"
              onClick={() => navigate("/userSearch")}
            >
              친구 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Friend Count */}
      <div className="px-4 py-3 bg-light border-bottom">
        <span className="small text-secondary">친구 {friendInfoList.length}</span>
      </div>

      {/* Friend List */}
      <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
        {friendInfoList.map((friend) => (
          <ListGroup.Item
            key={friend.friendId}
            action
            onContextMenu={(e) => menuRef.current?.openContextMenu(e, friend)} // 우클릭 시 메뉴 열기
            className="d-flex align-items-center border-0 px-4 py-3"
            onClick={() => {
              if (onSelectFriend) {
                onSelectFriend(friend); // 선물하기-> 리시버 선택 모드일 때
              } else {
                navigate("chat-room"); // 채팅방으로 이동 (데모)
              }} 
            }
          >
            {/* Profile Icon */}
            <div
              className="rounded-circle border border-2 border-dark d-flex align-items-center justify-content-center flex-shrink-0 me-3"
              style={{ width: "48px", height: "48px" }}
            >
              <span className="fw-bold">{friend.name[0]}</span>
            </div>

            {/* Name */}
            <span className="fw-bold">{friend.name}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Bottom Navigation (Placeholder) */}
      <div className="border-top p-3 d-flex justify-content-around">
        <Button
          variant="link"
          className="text-dark fw-bold text-decoration-none"
        >
          친구
        </Button>
        <Button
          variant="link"
          className="text-secondary text-decoration-none"
          onClick={() => navigate("/chatroom/list")}
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
    </div>
  );
};

export default FriendList;
