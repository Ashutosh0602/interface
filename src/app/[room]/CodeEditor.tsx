"use client";

import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import io from "socket.io-client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";

const socket = io("http://localhost:8001");

export default function CodeEditor() {
  const params = useParams();
  const room = params?.room;
  const [code, setCode] = useState("");

  useEffect(() => {
    // Listen for code updates from the server
    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    // Cleanup on unmount
    return () => {
      socket.off("codeUpdate");
    };
  }, []);

  const handleEditorChange = (value: any, event: any) => {
    setCode(value);
    // Emit code changes to the server
    socket.emit("codeChange", value);
  };

  return (
    <div>
      <div className="flex justify-center my-1">
        <Select>
          <SelectTrigger className="w-[180px] h-8 bg-blue-500 border-none">
            <SelectValue placeholder="Javascript" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">Javascript</SelectItem>
              <SelectItem value="cpp">CPP</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Editor
        height="80vh"
        language="javascript"
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}
