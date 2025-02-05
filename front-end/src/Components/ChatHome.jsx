import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Header from "./Header";
import { ImSpinner6 } from "react-icons/im";
import { IoSend } from "react-icons/io5";
const socket = io("https://chatmeet-1.onrender.com");

const ChatHome = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState(null);
  const [isConnectedToChat, setIsConnectedToChat] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isSearching, setIsSearching] = useState(true);
  const quote = "Searching";
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:chatmeet.onrender.com:3478",
        username: "anonymouschatmeet",
        credential: "anonymouschatmeet",
      },
    ],
  };

  useEffect(() => {
    socket.on("connectedToChat", (room) => {
      setChatRoom(room);
      setIsConnectedToChat(true);
      console.log(`Connected to room: ${room}`);

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: "system", text: "Stranger connected.", type: "connected" },
      ]);

      setIsSearching(true);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("connectedToChat");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    const pc = new RTCPeerConnection(iceServers);
    setPeerConnection(pc);
    let isNegotiating = false;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote stream:", event.streams[0]);
      remoteVideoRef.current.srcObject = event.streams[0];

      remoteVideoRef.current.onloadedmetadata = () => {
        console.log("Remote video metadata loaded");
        remoteVideoRef.current.play().catch((error) => {
          console.error("Error trying to play remote video:", error);
        });
      };

      setIsSearching(false);
    };
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        console.log("Local video tracks:", stream.getTracks());

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
    socket.on("offer", async (offer) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer);
      } catch (error) {
        console.error("Error handling offer", error);
      }
    });

    socket.on("answer", async (answer) => {
      try {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
          console.warn(
            "Skipping answer because signalingState is:",
            pc.signalingState
          );
        }
      } catch (error) {
        console.error("Error handling answer", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding received ICE candidate", error);
      }
    });

    pc.onnegotiationneeded = async () => {
      if (isNegotiating) return;
      isNegotiating = true;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", offer);
      } catch (error) {
        console.error("Error during negotiation", error);
      } finally {
        isNegotiating = false;
      }
    };

    return () => {
      pc.close();
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      setIsSearching(true);
    };
  }, [chatRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && chatRoom) {
      socket.emit("message", { room: chatRoom, text: newMessage });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewStranger = () => {
    if (peerConnection) {
      peerConnection.close();
    }

    setPeerConnection(null);
    setMessages([]);
    setChatRoom(null);
    setIsConnectedToChat(false);

    if (remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
      setIsSearching(true);
    }

    socket.disconnect();
    socket.connect();
  };

  useEffect(() => {
    socket.on("message", (message) => {
      if (message.text === "Stranger has been disconnected.") {
        setIsConnectedToChat(false);

        if (remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject.getTracks().forEach((track) => {
            track.stop();
          });
          remoteVideoRef.current.srcObject = null;
        }
      }
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        handleNewStranger();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [peerConnection]);

  console.log(isSearching);

  return (
    <>
      <Header />
      <main
        className="d-flex"
        style={{ height: "90vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="d-flex flex-column col-lg-4 col-md-5 p-2 gap-3">
          <div
            className="card bg-secondary border-0 shadow-sm rounded-3 overflow-hidden"
            style={{ height: "45%" }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              className="w-100 h-100 object-fit-cover rounded"
            />
          </div>
          <div
            className="card  border-0 shadow-sm rounded-3 overflow-hidden"
            style={{ height: "45%", position: "relative" }}
          >
            {isSearching && (
              <div
                className="d-flex flex-column align-items-center justify-content-center position-absolute"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  width: "100%",
                  height: "100%",
                  zIndex: 10,
                }}
              >
                <p className="fs-5 text-muted">
                  <ImSpinner6 className="me-2 spinner" size={30} />
                  {quote}...
                </p>
              </div>
            )}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-100 h-100 object-fit-cover rounded"
            />
          </div>
        </div>

        <div className="col-lg-8 col-md-7 p-2 chat-container">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body overflow-auto" style={{ height: "80vh" }}>
              {messages.length === 0 && (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="bg-info text-center p-3 rounded fs-5 fw-semibold mb-0">
                    Click "New Stranger" to connect with new strangers!
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`d-flex flex-column ${
                    message.id === socket.id
                      ? "align-items-end "
                      : message.id === "system"
                      ? "align-items-center"
                      : "align-items-start "
                  }`}
                >
                  {message.id === "system" ? (
                    <span
                      className={`small fw-bold mb-2 px-2 py-1 rounded ${
                        message.type === "connected"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                      }`}
                    >
                      {message.text}
                    </span>
                  ) : (
                    <>
                      <span
                        className={`small fw-bold ${
                          message.id === socket.id
                            ? "text-primary"
                            : "text-danger"
                        }`}
                      >
                        {message.id === socket.id ? "You:" : "Stranger:"}
                      </span>
                      <p
                        className={`px-3 py-2 mb-2 rounded shadow-sm ${
                          message.id === socket.id
                            ? "bg-primary text-white "
                            : "bg-light text-dark border "
                        }`}
                        style={{
                          maxWidth: "80%",
                          wordWrap: "break-word",
                        }}
                      >
                        {message.text}
                      </p>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="card-footer d-flex align-items-center gap-3 p-3 bg-light rounded-bottom">
              <button
                className="btn btn-outline-primary rounded-pill"
                onClick={handleNewStranger}
              >
                New
              </button>

              <input
                autoFocus={true}
                type="text"
                className="form-control rounded-pill"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="btn btn-primary rounded-circle"
                onClick={handleSendMessage}
              >
                <IoSend />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatHome;
