import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Collapse,
  Avatar,
  CircularProgress,
  useTheme,
  Zoom,
} from "@mui/material";
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  DragHandle as DragHandleIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import ReactMarkdown from "react-markdown";
import chatbotAvatar from "assets/images/users/chatbot.avif";
import { getSystemPrompt, getInitialGreeting } from "./ChatBotKnowledge";

// Define animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typingAnimation = keyframes`
  0% { transform: translateY(0px); }
  28% { transform: translateY(-5px); }
  44% { transform: translateY(0px); }
`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: getInitialGreeting(),
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 350, height: 500 });
  const apiKey = import.meta.env.VITE_GEMINI_API;
  const messagesEndRef = useRef(null);
  const resizingRef = useRef(false);
  const startCoordRef = useRef({ x: 0, y: 0 });
  const startDimensionsRef = useRef({ width: 350, height: 500 });
  const theme = useTheme();

  // Add state for speech bubble
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");

  // Array of attention-grabbing messages
  const attentionMessages = [
    "Hi, how can I assist you today?",
    "Need help with finances?",
    "Have questions about transactions?",
    "Looking for fraud detection info?",
    "Need financial guidance?",
    "Stuck? I can help!",
    "Questions about Money Map?",
  ];

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cycle through attention messages when chat is closed
  useEffect(() => {
    let messageInterval;
    let visibilityInterval;

    if (!isOpen) {
      // Set initial message
      const randomIndex = Math.floor(Math.random() * attentionMessages.length);
      setBubbleMessage(attentionMessages[randomIndex]);

      // Show bubble every 10 seconds for 5 seconds
      visibilityInterval = setInterval(() => {
        setShowBubble((prev) => !prev);
      }, 5000);

      // Change message every 15 seconds
      messageInterval = setInterval(() => {
        const newIndex = Math.floor(Math.random() * attentionMessages.length);
        setBubbleMessage(attentionMessages[newIndex]);
      }, 15000);
    } else {
      // Hide bubble when chat is open
      setShowBubble(false);
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(visibilityInterval);
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBubble(false);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    startCoordRef.current = { x: e.clientX, y: e.clientY };
    startDimensionsRef.current = { ...dimensions };

    const handleMouseMove = (e) => {
      if (resizingRef.current) {
        const deltaX = e.clientX - startCoordRef.current.x;
        const deltaY = e.clientY - startCoordRef.current.y;

        setDimensions({
          width: Math.max(300, startDimensionsRef.current.width + deltaX),
          height: Math.max(400, startDimensionsRef.current.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const generateGeminiResponse = async (prompt) => {
    if (!apiKey) {
      return "API key not configured. Please contact support.";
    }

    try {
      // Use the exact format from the curl example
      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      // Include context using the prompt directly
      const enhancedPrompt = `
${getSystemPrompt()}

USER QUESTION: ${prompt}

Please answer based on the context above.`;

      // Update the request to use the enhanced prompt
      requestBody.contents[0].parts[0].text = enhancedPrompt;

      // Update to use gemini-2.0-flash model as specified in the curl example
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      // Extract the response text from the API response
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        return (
          data.candidates[0].content.parts[0].text || "No response text found."
        );
      } else {
        console.error("Unexpected API response format:", data);
        return "I received an unexpected response format. Please try again.";
      }
    } catch (error) {
      console.error("Error generating response:", error);
      return "I encountered an error. Please try again later.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      // Generate response using Gemini
      const botResponse = await generateGeminiResponse(userMessage);

      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error processing your request.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animated dots for loading indicator
  const LoadingDots = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 1 }}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          component="span"
          sx={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            bgcolor: "primary.main",
            display: "inline-block",
            animation: `${typingAnimation} 1.4s infinite ease-in-out both`,
            animationDelay: `${dot * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ position: "fixed", bottom: 30, right: -230, zIndex: 1000 }}>
      {/* Chat Interface */}
      <Collapse in={isOpen} timeout="auto">
        <Paper
          elevation={6}
          sx={{
            right: 310,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            mb: 2,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
            },
            position: "relative",
            // Positioned to right of the button
            marginRight: 0,
            transform: "translateX(0)",
          }}
        >
          {/* Header */}
          <Box
            sx={{

              p: 2,
              background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={chatbotAvatar}
                alt="AI Assistant"
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  border: "2px solid white",
                  animation: `${pulseAnimation} 5s infinite ease-in-out`,
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  Financial Assistant
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.9, display: "block", mt: -0.5 }}
                >
                  Powered by Gemini AI
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              sx={{ color: "white" }}
              onClick={toggleChat}
              aria-label="close chat"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <List
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  background: "#a8a8a8",
                },
              },
            }}
          >
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: message.isBot ? "flex-start" : "flex-end",
                  mb: 1.5,
                  alignItems: "flex-start",
                  padding: 0,
                  animation: `${fadeInAnimation} 0.4s ease-out`,
                }}
              >
                {message.isBot && (
                  <Avatar
                    src={chatbotAvatar}
                    alt="AI Assistant"
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                    }}
                  />
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: message.isBot
                      ? "4px 16px 16px 16px"
                      : "16px 4px 16px 16px",
                    maxWidth: "75%",
                    background: message.isBot
                      ? "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)"
                      : "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
                    color: message.isBot ? "text.primary" : "white",
                    ml: message.isBot ? 0 : 1,
                    mr: message.isBot ? 1 : 0,
                    boxShadow: message.isBot
                      ? "0 2px 6px rgba(0, 0, 0, 0.05)"
                      : "0 2px 6px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  {message.isBot ? (
                    <Box
                      sx={{
                        "& p": {
                          margin: 0,
                          lineHeight: 1.6,
                          fontWeight: 400,
                        },
                        "& strong": {
                          fontWeight: 600,
                        },
                        "& a": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                        "& ul, & ol": {
                          paddingLeft: "20px",
                          marginTop: "8px",
                          marginBottom: "8px",
                        },
                        "& li": {
                          marginBottom: "4px",
                        },
                        "& code": {
                          backgroundColor: "rgba(0,0,0,0.05)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          fontSize: "0.85em",
                        },
                      }}
                    >
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 400,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.text}
                    </Typography>
                  )}
                </Paper>
              </ListItem>
            ))}
            {isLoading && (
              <ListItem
                sx={{
                  justifyContent: "flex-start",
                  mb: 1.5,
                  padding: 0,
                  animation: `${fadeInAnimation} 0.3s ease-out`,
                }}
              >
                <Avatar
                  src={chatbotAvatar}
                  alt="AI Assistant"
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: "4px 16px 16px 16px",
                    background:
                      "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    minWidth: "60px",
                    height: "36px",
                  }}
                >
                  <LoadingDots />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          {/* Input */}
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "rgba(0, 0, 0, 0.08)",
              display: "flex",
              backgroundColor: "rgba(247, 248, 251, 0.8)",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              variant="outlined"
              sx={{
                mr: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              type="submit"
              disabled={isLoading || !input.trim()}
              sx={{
                background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                color: "white",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
                },
                "&.Mui-disabled": {
                  background: "#e0e0e0",
                  color: "#a1a1a1",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>

          {/* Resize Handle */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "20px",
              height: "20px",
              cursor: "nwse-resize",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onMouseDown={handleMouseDown}
          >
            <DragHandleIcon
              sx={{
                transform: "rotate(-45deg)",
                fontSize: "16px",
                color: "rgba(0, 0, 0, 0.3)",
              }}
            />
          </Box>
        </Paper>
      </Collapse>

      {/* Integrated Chatbot Button and Speech Bubble */}
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* Speech Bubble */}
        <Zoom
          in={showBubble && !isOpen}
          style={{ transitionDelay: showBubble ? "100ms" : "0ms" }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: 65, // Position just above the button
              right: 0,
              transform: "translateX(-15%)", // Slight offset for better appearance
              maxWidth: 350,
              backgroundColor: "#fff",
              borderRadius: "18px",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: "-10px",
                right: "25px",
                border: "10px solid transparent",
                borderTop: "10px solid #fff",
                borderRight: "10px solid #fff",
                transform: "rotate(45deg)",
                boxShadow: "4px 4px 5px -4px rgba(0, 0, 0, 0.1)",
              },
              animation: `${fadeInAnimation} 0.3s ease-out`,
              zIndex: 10,
              marginBottom: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "0.95rem",
                color: "text.primary",
                lineHeight: 1.5,
              }}
            >
              {bubbleMessage}
            </Typography>
          </Box>
        </Zoom>

        {/* Chat Button */}
        <Fab
          sx={{
            background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
            color: "white",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.5)",
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
            },
            animation: isOpen
              ? "none"
              : `${pulseAnimation} 2s infinite ease-in-out`,
            padding: isOpen ? "normal" : 0,
            overflow: "hidden",
            zIndex: 20, // Ensure button is above bubble pointer
          }}
          onClick={toggleChat}
          aria-label="chat"
        >
          {isOpen ? (
            <CloseIcon />
          ) : (
            <Avatar
              src={chatbotAvatar}
              alt="AI Assistant"
              sx={{
                width: "100%",
                height: "100%",
                border: "2px solid rgba(255, 255, 255, 0.5)",
              }}
            />
          )}
        </Fab>
      </Box>
    </Box>
  );
};

export default ChatBot;
