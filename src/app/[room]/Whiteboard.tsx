import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const Whiteboard = () => {
  const canvasRef: any = useRef(null);
  const contextRef: any = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("black");
  const [inputVisible, setInputVisible] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [inputValue, setInputValue] = useState("");
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas: any = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = tool === "pen" ? 5 : 2;
    contextRef.current = context;

    socket.on("draw", ({ prevX, prevY, currX, currY, tool, color }) => {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = tool === "pen" ? 5 : 2;
      if (tool === "eraser") {
        contextRef.current.globalCompositeOperation = "destination-out";
        contextRef.current.lineWidth = 10;
      } else {
        contextRef.current.globalCompositeOperation = "source-over";
      }
      contextRef.current.beginPath();
      contextRef.current.moveTo(prevX, prevY);
      contextRef.current.lineTo(currX, currY);
      contextRef.current.stroke();
      contextRef.current.closePath();
    });

    socket.on("text", ({ x, y, text, color }) => {
      drawText(contextRef.current, text, x, y, color);
    });

    socket.on("shape", ({ shape, startX, startY, endX, endY, color }) => {
      drawShape(contextRef.current, shape, startX, startY, endX, endY, color);
    });

    return () => {
      socket.off("draw");
      socket.off("text");
      socket.off("shape");
    };
  }, [color, tool]);

  const startDrawing = ({ nativeEvent }: any) => {
    if (tool === "text") return;
    const { offsetX, offsetY } = nativeEvent;
    if (tool === "shape") {
      setStartPosition({ x: offsetX, y: offsetY });
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    }
    setIsDrawing(true);
  };

  const finishDrawing = ({ nativeEvent }: any) => {
    if (tool === "text") return;
    setIsDrawing(false);
    if (tool === "shape") {
      const { offsetX, offsetY } = nativeEvent;
      const { x: startX, y: startY } = startPosition;
      drawShape(
        contextRef.current,
        tool,
        startX,
        startY,
        offsetX,
        offsetY,
        color
      );
      socket.emit("shape", {
        shape: tool,
        startX,
        startY,
        endX: offsetX,
        endY: offsetY,
        color,
      });
    }
    contextRef.current.closePath();
  };

  const draw = ({ nativeEvent }: any) => {
    if (!isDrawing || tool === "text" || tool === "shape") return;
    const { offsetX, offsetY } = nativeEvent;
    const { offsetX: prevX, offsetY: prevY } = contextRef.current.__lastPos || {
      offsetX,
      offsetY,
    };
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    socket.emit("draw", {
      prevX,
      prevY,
      currX: offsetX,
      currY: offsetY,
      tool,
      color,
    });
    contextRef.current.__lastPos = { offsetX, offsetY };
  };

  const handleToolChange = (newTool: any) => {
    setTool(newTool);
    if (newTool === "eraser") {
      contextRef.current.globalCompositeOperation = "destination-out";
      contextRef.current.lineWidth = 10;
    } else {
      contextRef.current.globalCompositeOperation = "source-over";
      contextRef.current.lineWidth = newTool === "pen" ? 5 : 2;
    }
  };

  const handleCanvasClick = (event: any) => {
    if (tool !== "text" && tool !== "shape") return;
    const { offsetX, offsetY } = event.nativeEvent;
    setInputPosition({ x: offsetX, y: offsetY });
    setInputVisible(true);
    setInputValue("");
  };

  const handleTextSubmit = (e: any) => {
    e.preventDefault();
    const { x, y } = inputPosition;
    const text = inputValue;
    drawText(contextRef.current, text, x, y, color);
    socket.emit("text", { x, y, text, color });
    setInputVisible(false);
  };

  const drawText = (
    context: any,
    text: any,
    x: number,
    y: number,
    color: string
  ) => {
    context.font = "20px Arial";
    context.fillStyle = color;
    context.fillText(text, x, y);
  };

  const drawShape = (
    context: any,
    shape: any,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string
  ) => {
    context.strokeStyle = color;
    context.lineWidth = 2;
    switch (shape) {
      case "circle":
        const radius = Math.sqrt(
          Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
        );
        context.beginPath();
        context.arc(startX, startY, radius, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
        break;
      case "triangle":
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.lineTo(startX * 2 - endX, endY);
        context.closePath();
        context.stroke();
        break;
      case "line":
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.closePath();
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => handleToolChange("pen")}>Pen</button>
        <button onClick={() => handleToolChange("pencil")}>Pencil</button>
        <button onClick={() => handleToolChange("eraser")}>Eraser</button>
        <button onClick={() => handleToolChange("text")}>Text</button>
        <button onClick={() => handleToolChange("circle")}>Circle</button>
        <button onClick={() => handleToolChange("triangle")}>Triangle</button>
        <button onClick={() => handleToolChange("line")}>Line</button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      {inputVisible && (
        <form
          style={{
            position: "absolute",
            left: inputPosition.x,
            top: inputPosition.y,
          }}
          onSubmit={handleTextSubmit}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseOut={finishDrawing}
        onMouseMove={draw}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default Whiteboard;
