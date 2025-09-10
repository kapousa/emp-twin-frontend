import styled from 'styled-components';

export const AskPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  font-family: Arial, sans-serif;
`;

export const ConversationList = styled.div`
  width: 250px;
  border-right: 1px solid #ccc;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const ConversationItem = styled.div`
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: #f0f0f0;
  }
`;

export const MessagesWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f9f9f9;
`;

export const Message = styled.div<{ sender: 'user' | 'bot' }>`
  display: flex;
  justify-content: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
`;

export const MessageContent = styled.div`
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 70%;
  background-color: #e2e2e2;
`;

export const AskActions = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #ccc;
  background-color: #fff;
`;

export const AskInput = styled.input`
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 15px;
  margin: 0 10px;
  font-size: 16px;
  outline: none;
  &:focus {
    border-color: #007bff;
  }
`;

export const AskButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;