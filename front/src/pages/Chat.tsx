/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Menu, Dropdown, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import "./styles.scss";
import ChatMessage, { ChatMessageProps } from "../components/ChatMessage";
import { useChat } from "../store/hooks";
import { useDispatch } from "react-redux";
import { initialFetchMessages } from "../store/routines/messages";
import { chatService } from "../api";
import { chatActions } from "../store/features/messages";

export default function ChatRoom() {
  const [messageText, setMessageText] = useState("");
  const { messages, randomName } = useChat();
  const dispatch = useDispatch();

  // TODO
  /**
   * Agora, é hora de aprimorar o armazenamento das mensagens! Atualmente,
   * o ChatEnvio está registrando suas mensagens no estado do componente,
   * o que não é ideal para uma aplicação destinada a atender milhares de usuários.
   * Recomendo que adote uma abordagem mais escalável,
   * como utilizar um gerenciador de estado como o Redux.
   * Isso proporcionará uma gestão mais eficiente e otimizada das mensagens,
   * garantindo um desempenho superior à medida que a aplicação cresce em escala.
   */

  // const [messages, setMessages] = useState<Array<ChatMessageProps>>([]);
  const dummy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    const heartbeat = () => {
      if (!socket) return;
      if (socket.readyState !== 1) return;
      socket.send(JSON.stringify({ ping: "Pong" }));
      setTimeout(heartbeat, 10000);
    };

    socket.onopen = function () {
      heartbeat();
      message.success("Seu chat está conectado! ✅");
    };
    const listener = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      // TODO addNewMessage
      /**
       *
       * É hora de sintonizar os eventos no WebSocket!
       * Implemente uma lógica de listener para capturar os eventos enviados pelo backend,
       * adicionando as mensagens ao chat em tempo real. Essa implementação garantirá uma
       * experiência dinâmica e instantânea, permitindo que as mensagens sejam exibidas no
       * chat assim que forem recebidas do backend.
       *
       */
      if (data.type === "heartbeat" || data.message.senderName === randomName)
        return;
      dispatch(chatActions.add({ ...data.message, fromMe: false }));
    };

    socket.addEventListener("message", listener);
    socket.onclose = function () {
      message.success("Erro ao conectar (onclose)");
    };
    socket.onerror = function () {
      message.success("Erro ao conectar (onerror)");
    };

    return () => {
      socket?.close();
    };
  }, [randomName]);

  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    dispatch(initialFetchMessages());
  }, []);

  const handleMessageOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    setMessageText(event.target.value);
  };

  const handleCreateMessage = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (messageText && dummy.current) {
      // TODO sendMessage
      /**
       * 
        Desenvolva a lógica de envio da nova mensagem para o backend. 
        Essa implementação garantirá que as mensagens enviadas sejam processadas de forma eficiente, 
        permitindo uma comunicação contínua e confiável entre o frontend e o backend.
       */
      const data: ChatMessageProps = {
        fromMe: true,
        senderName: randomName,
        text: messageText,
      };

      const res = await chatService.sendMessage(data);
      dispatch(chatActions.add(res));

      setMessageText("");

      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => {}}>
        Edit group name
      </Menu.Item>
      <Menu.Item key="2" onClick={() => {}}>
        Change group icon
      </Menu.Item>
      <Menu.Item key="4" onClick={() => {}}>
        Exit group
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="chat-container">
        <div className="chat-container__background">
          <header style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="image">Fake</div>
            <Dropdown.Button
              style={{ width: 50 }}
              overlay={menu}
              icon={<MoreOutlined style={{ fontSize: "1.65rem" }} />}
            />
          </header>
          <main>
            <div>
              {messages.map((msg, index) => {
                const { senderName, text, createdAt } = msg;
                return (
                  <ChatMessage
                    key={index}
                    fromMe={senderName === randomName}
                    senderName={senderName === randomName ? "Eu" : senderName}
                    text={text}
                    createdAt={createdAt}
                  />
                );
              })}
              <div ref={dummy} />
            </div>
          </main>
          <footer>
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                type="text"
                value={messageText}
                placeholder="Type a message"
                onChange={handleMessageOnChange}
              />
              <Button onClick={handleCreateMessage}>Send message</Button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
