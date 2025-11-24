////////////////////////////////////////
// 작업 중
////////////////////////////////////////

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

const FriendListContextMenu = forwardRef((props, ref) => {
  const navigate = useNavigate();

  const [contextMenu, setContextMenu] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [targetFriend, setTargetFriend] = useState(null);
  const [roomName, setRoomName] = useState("");

  // 부모에서 openContextMenu 호출 가능하도록 제공
  useImperativeHandle(ref, () => ({
    openContextMenu: (e, friend) => {
      e.preventDefault();
      e.stopPropagation();

      setContextMenu({
        x: e.pageX,
        y: e.pageY,
        friend,
      });
    },
  }));

  // 방 생성 버튼 실행
  const createChatRoom = () => {
    navigate("/chatroom/new", {
      state: {
        friend: targetFriend,   // 선택된 친구 정보
        roomName: roomName,    // 모달에서 입력한 채팅방 이름
      },
    });
  };

  return (
    <>
      {/* 우클릭 메뉴 */}
      {contextMenu && (
        <div
          className="position-fixed bg-white border shadow"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            padding: "8px 0",
            width: "150px",
            zIndex: 9999,
            borderRadius: "6px",
          }}
          onClick={() => setContextMenu(null)}
        >
          <div
            className="px-3 py-2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTargetFriend(contextMenu.friend);
              setRoomName(`${contextMenu.friend.name}님과의 채팅방`); // 기본 이름
              setShowNameModal(true);

              setContextMenu(null);
            }}
          >
            채팅방 생성
          </div>
        </div>
      )}

      {/* 채팅방 이름 설정 모달 */}
      {showNameModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 9998 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "80%", maxWidth: 350 }}
          >
            <h5 className="mb-3">채팅방 이름 설정</h5>

            <Form.Control
              placeholder="채팅방 이름을 입력하세요"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mb-3"
            />

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowNameModal(false)}>
                취소
              </Button>
              <Button
                variant="dark"
                disabled={roomName.trim() === ""}
                onClick={createChatRoom}
              >
                만들기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default FriendListContextMenu;
