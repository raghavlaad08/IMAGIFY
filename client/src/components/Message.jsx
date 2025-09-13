import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import { assets } from '../assets/assets';
import Prism from 'prismjs'

const Message = ({ message }) => {
  useEffect(()=>{
    Prism.highlightAll()

  },[message.content])
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} my-4`}>
      <div className={`flex items-start gap-2 max-w-2xl ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <img
            src={"src/assets/user_icon.svg"}
            alt="Assistant icon"
            className="w-8 rounded-full"
          />
        )}
        <div className={`
          flex flex-col gap-2 p-2 px-4 rounded-md
          ${isUser
            ? 'bg-slate-50 border border-gray-300 dark:bg-[#57317C]/30 dark:border-[#80609F]/30'
            : 'bg-primary/20 dark:bg-[#80609F]/30'}
        `}>
          {message.isImage ? (
            <img src={message.content} alt="Generated content" className="rounded-md" />
          ) : (
            <div className="prose dark:prose-invert text-sm reset-tw">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {isUser && (
          <img
            src={assets.user_icon}
            alt="User icon"
            className="w-8 rounded-full"
          />
        )}
      </div>

      <span className="text-xs text-gray-400 dark:text-[#B1A6C0] mt-1">
        {moment(message.timestamp).fromNow()}
      </span>
    </div>
  );
};

export default Message;
