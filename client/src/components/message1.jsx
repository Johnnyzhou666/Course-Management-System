import { useEffect } from "react";
// It shows a temporary notification and automatically closes after a given time.
export default function Message1({
  content1,
  color = "orange",
  time = 15000,
  shut1,
}) {
  useEffect(() => {
    if (!content1) return;

    const duration1 = setTimeout(() => {
      shut1 && shut1();
    }, time);
    // Clear the timer when the component unmounts or dependencies change
    return () => clearTimeout(duration1);
  }, [content1, time, shut1]);
  // If there is no message content, do nothing
  if (!content1) return null;

  return (
    <div
      style={{
        display: "block",
        background: "#ffffff",
        fontSize: "larger",
        width: "100%",
        color: color,
        textAlign: "center",
        padding: "10px",
        paddingBottom: "20px",
      }}
    >
      {String(content1)}
    </div>
  );
}
