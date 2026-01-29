'use client';
import {Attachment, AttachmentPreview, AttachmentRemove, Attachments,} from '@/components/ai-elements/attachments';
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputBody,
    PromptInputButton,
    PromptInputFooter,
    PromptInputHeader,
    type PromptInputMessage,
    PromptInputSelect,
    PromptInputSelectContent,
    PromptInputSelectItem,
    PromptInputSelectTrigger,
    PromptInputSelectValue,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
    usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import {GlobeIcon} from 'lucide-react';
import {useState} from 'react';
import {useChat} from '@ai-sdk/react';
import {Conversation, ConversationContent, ConversationScrollButton,} from '@/components/ai-elements/conversation';
import {Message, MessageContent, MessageResponse} from '@/components/ai-elements/message';

const PromptInputAttachmentsDisplay = () => {
    const attachments = usePromptInputAttachments();
    if (attachments.files.length === 0) {
        return null;
    }
    return (
        <Attachments variant="inline">
            {attachments.files.map((attachment) => (
                <Attachment
                    data={attachment}
                    key={attachment.id}
                    onRemove={() => attachments.remove(attachment.id)}
                >
                    <AttachmentPreview/>
                    <AttachmentRemove/>
                </Attachment>
            ))}
        </Attachments>
    );
};
const models = [
    {id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini'},
    {id: 'gpt-5.2', name: 'GPT-5.2'},
];
const InputDemo = () => {
    const [text, setText] = useState<string>('');
    const [model, setModel] = useState<string>(models[0].id);
    const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
    const {messages, status, sendMessage} = useChat();
    const handleSubmit = (message: PromptInputMessage) => {
        const hasText = Boolean(message.text);
        const hasAttachments = Boolean(message.files?.length);
        if (!(hasText || hasAttachments)) {
            return;
        }
        sendMessage(
            {
                text: message.text || 'Sent with attachments',
                files: message.files
            },
            {
                body: {
                    model: model,
                    webSearch: useWebSearch,
                },
            },
        );
        setText('');
    };
    return (
        <div className="max-w-4xl mx-auto relative size-full rounded-lg h-[850px]">
            <div className="flex flex-col h-full">
                <Conversation>
                    <ConversationContent>
                        {messages.map((message) => (
                            <Message from={message.role} key={message.id}>
                                <MessageContent>
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <MessageResponse key={`${message.id}-${i}`}>
                                                        {part.text}
                                                    </MessageResponse>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        ))}
                    </ConversationContent>
                    <ConversationScrollButton/>
                </Conversation>
                <PromptInput onSubmit={handleSubmit} className="mt-4 bg-white" globalDrop multiple>
                    <PromptInputHeader>
                        <PromptInputAttachmentsDisplay/>
                    </PromptInputHeader>
                    <PromptInputBody>

                        <PromptInputTextarea
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                        />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools>
                            <PromptInputActionMenu>
                                <PromptInputActionMenuTrigger/>
                                <PromptInputActionMenuContent>
                                    <PromptInputActionAddAttachments/>
                                </PromptInputActionMenuContent>
                            </PromptInputActionMenu>
                            <PromptInputButton
                                onClick={() => setUseWebSearch(!useWebSearch)}
                                variant={useWebSearch ? 'default' : 'ghost'}
                            >
                                <GlobeIcon size={16}/>
                                <span>Search</span>
                            </PromptInputButton>
                            <PromptInputSelect
                                onValueChange={(value) => {
                                    setModel(value);
                                }}
                                value={model}
                            >
                                <PromptInputSelectTrigger>
                                    <PromptInputSelectValue/>
                                </PromptInputSelectTrigger>
                                <PromptInputSelectContent>
                                    {models.map((model) => (
                                        <PromptInputSelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </PromptInputSelectItem>
                                    ))}
                                </PromptInputSelectContent>
                            </PromptInputSelect>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!text && !status} status={status}/>
                    </PromptInputFooter>
                </PromptInput>
                <span className="text-center text-muted-foreground py-2 text-xs">
                    AI can make mistakes. Check important information and don't share sensitive data.
                </span>
            </div>
        </div>
    );
};
export default InputDemo;
