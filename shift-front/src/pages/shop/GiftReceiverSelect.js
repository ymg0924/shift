import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FriendList from "../chat/FriendList"; 

const GiftReceiverSelect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = location.state?.items || [];

  const handleSelectFriend = (friend) => {
    // 전역 변수로 receiverId 저장
    window.SHIFT_RECEIVER_ID = friend.id;

    // Checkout 페이지로 이동 + receiverId도 state로 같이 전달
    navigate("/checkout", {
      state: {
        items: location.state?.items ?? [],
        receiverId: friend.id,
        isGift: true,
      },
    });
  };

  return (
    <FriendList
      onSelectFriend={handleSelectFriend}
    />
  );
};

export default GiftReceiverSelect;
