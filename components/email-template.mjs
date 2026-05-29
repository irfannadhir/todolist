import React from "react";

export function EmailTemplate({ firstName, dueDateLabel, tasks }) {
  return React.createElement(
    "div",
    { style: { fontFamily: "Arial, sans-serif", color: "#17171c", lineHeight: "1.5" } },
    React.createElement("p", null, `Halo ${firstName},`),
    React.createElement(
      "p",
      null,
      "Berikut pengingat task Anda untuk ",
      React.createElement("strong", null, dueDateLabel),
      ":",
    ),
    React.createElement(
      "table",
      {
        style: { borderCollapse: "collapse", width: "100%", marginTop: "12px" },
      },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { style: headerCellStyle }, "Judul"),
          React.createElement("th", { style: headerCellStyle }, "Jam"),
          React.createElement("th", { style: headerCellStyle }, "Status"),
          React.createElement("th", { style: headerCellStyle }, "Deskripsi"),
        ),
      ),
      React.createElement(
        "tbody",
        null,
        ...tasks.map((task, index) =>
          React.createElement(
            "tr",
            { key: `${task.title}-${index}` },
            React.createElement("td", { style: bodyCellStyle }, task.title),
            React.createElement("td", { style: bodyCellStyle }, task.dueTime ?? "-"),
            React.createElement("td", { style: bodyCellStyle }, task.status),
            React.createElement("td", { style: bodyCellStyle }, task.description ?? "-"),
          ),
        ),
      ),
    ),
    React.createElement(
      "p",
      { style: { marginTop: "16px" } },
      "Silakan cek dashboard untuk update task Anda.",
    ),
  );
}

const headerCellStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  background: "#f5f5f5",
  textAlign: "left",
};

const bodyCellStyle = {
  padding: "8px",
  border: "1px solid #ddd",
};
