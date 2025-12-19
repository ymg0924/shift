import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { getUserPointHistory, getMyInfo } from "../../api/userApi";

const MyPointTab = () => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (str) => {
    const d = new Date(str);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatNumber = (n) => (n == null ? "-" : Number(n).toLocaleString());

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    setLoading(true);
    try {
      const user = await getMyInfo();
      setPoints(user.points || 0);

      const historyRes = await getUserPointHistory(user.userId);
      setHistory(historyRes.history || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-3">
      {/* 보유 포인트 박스 */}
      <div
        className="rounded-3 p-5 text-center mb-4"
        style={{ backgroundColor: "#5b8fc3" }}
      >
        <div className="text-white-50 small">보유 포인트</div>
        <h2 className="fw-bold text-white">{formatNumber(points)}P</h2>
      </div>

      <h5 className="fw-bold mb-3" style={{ color: "#5b8fc3" }}>
        포인트 내역
      </h5>

      {loading && (
        <div className="d-flex justify-content-center py-4">
          <Spinner animation="border" style={{ color: "#5b8fc3" }} />
        </div>
      )}

      {!loading &&
        history.map((item) => (
          <Card
            key={item.transactionId}
            className="border-5 border-bottom border-light rounded-0 py-2"
            style={{ backgroundColor: "#eaf2fb" }}
          >
            <Card.Body className="px-3">
              <div className="text-muted small mb-1">
                {formatDate(item.createdAt)}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span
                  className={`fw-semibold`}
                  style={{
                    color:
                      item.type === "U"
                        ? "#dc3545"
                        : item.type === "A"
                        ? "#5b8fc3"
                        : "#198754",
                  }}
                >
                  {{
                    A: "적립",
                    U: "사용",
                    R: "복원",
                  }[item.type] || "기타"}
                </span>

                <span
                  className={`fw-bold`}
                  style={{
                    color:
                      item.type === "U"
                        ? "#dc3545"
                        : item.type === "A"
                        ? "#5b8fc3"
                        : "#198754",
                  }}
                >
                  {item.type === "U" ? "-" : "+"}
                  {formatNumber(item.amount)} P
                </span>
              </div>
            </Card.Body>
          </Card>
        ))}
    </div>
  );
};

export default MyPointTab;
