import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, Plus, Settings, LogOut, Coffee, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ModelIndicator from '@/components/chat/ModelIndicator';
import ProjectList from '@/components/sidebar/ProjectList';
import ChatList from '@/components/sidebar/ChatList';
import UsageIndicator from '@/components/common/UsageIndicator';
import UpgradeModal from '@/components/modals/UpgradeModal';
import NewProjectModal from '@/components/modals/NewProjectModal';

export default function Home() {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [currentMode, setCurrentMode] = useState('code');
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    // Load user
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
            } catch (e) {
                console.log('Not logged in');
            }
        };
        loadUser();
    }, []);

    // Get current month-year for usage tracking
    const getCurrentMonthYear = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    // Queries
    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => base44.entities.Project.list('-updated_date'),
        enabled: !!user,
    });

    const { data: allChats = [] } = useQuery({
        queryKey: ['chats', selectedProjectId],
        queryFn: () => selectedProjectId 
            ? base44.entities.Chat.filter({ project_id: selectedProjectId }, '-updated_date')
            : base44.entities.Chat.list('-updated_date'),
        enabled: !!user,
    });

    const { data: usage } = useQuery({
        queryKey: ['usage', getCurrentMonthYear()],
        queryFn: async () => {
            const usageRecords = await base44.entities.Usage.filter({ 
                month_year: getCurrentMonthYear(),
                created_by: user?.email 
            });
            return usageRecords[0] || { fast_requests: 0, slow_requests: 0 };
        },
        enabled: !!user,
    });

    const selectedChat = allChats.find(c => c.id === selectedChatId);
    const isPro = user?.plan === 'pro';

    // Check limits
    const checkLimits = (requestType = 'fast') => {
        const limit = isPro 
            ? (requestType === 'fast' ? 250 : Infinity)
            : 50;
        const used = requestType === 'fast' ? usage?.fast_requests : usage?.slow_requests;
        
        if (used >= limit) {
            toast.error(`You've reached your ${requestType} request limit. Upgrade to Pro for more!`);
            setUpgradeModalOpen(true);
            return false;
        }
        return true;
    };

    // Mutations
    const createProjectMutation = useMutation({
        mutationFn: (data) => base44.entities.Project.create(data),
        onSuccess: (newProject) => {
            queryClient.invalidateQueries(['projects']);
            setSelectedProjectId(newProject.id);
            setProjectModalOpen(false);
            toast.success('Project created!');
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            setProjectModalOpen(false);
            setEditingProject(null);
            toast.success('Project updated!');
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id) => base44.entities.Project.delete(id),
        onSuccess: (_data, deletedProjectId) => {
            queryClient.invalidateQueries(['projects']);
            if (selectedProjectId === deletedProjectId) {
                setSelectedProjectId(null);
                setSelectedChatId(null);
            }
            toast.success('Project deleted');
        },
    });

    const createChatMutation = useMutation({
        mutationFn: (data) => base44.entities.Chat.create(data),
        onSuccess: (newChat) => {
            queryClient.invalidateQueries(['chats']);
            setSelectedChatId(newChat.id);
        },
    });

    const updateChatMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Chat.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['chats']);
        },
    });

    const deleteChatMutation = useMutation({
        mutationFn: (id) => base44.entities.Chat.delete(id),
        onSuccess: (_data, deletedChatId) => {
            queryClient.invalidateQueries(['chats']);
            if (selectedChatId === deletedChatId) {
                setSelectedChatId(null);
            }
            toast.success('Chat deleted');
        },
    });

    const updateUsageMutation = useMutation({
        mutationFn: async (requestType) => {
            try {
                const monthYear = getCurrentMonthYear();
                const existing = await base44.entities.Usage.filter({ 
                    month_year: monthYear,
                    created_by: user?.email 
                });
                
                if (existing.length > 0) {
                    const current = existing[0];
                    const update = requestType === 'fast' 
                        ? { fast_requests: (current.fast_requests || 0) + 1 }
                        : { slow_requests: (current.slow_requests || 0) + 1 };
                    await base44.entities.Usage.update(current.id, update);
                } else {
                    await base44.entities.Usage.create({
                        month_year: monthYear,
                        fast_requests: requestType === 'fast' ? 1 : 0,
                        slow_requests: requestType === 'slow' ? 1 : 0,
                    });
                }
            } catch (error) {
                console.error("Usage tracking error:", error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['usage']);
        },
    });

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    // Send message
    const handleSendMessage = async (content) => {
        if (!user) {
            toast.error('Please sign in to continue');
            return;
        }

        if (!checkLimits('fast')) return;

        let chatId = selectedChatId;
        let messages = selectedChat?.messages || [];

        // Create new chat if needed
        if (!chatId) {
            const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            const newChat = await createChatMutation.mutateAsync({
                project_id: selectedProjectId,
                title,
                messages: [],
            });
            chatId = newChat.id;
            messages = [];
        }

        // Add user message
        const userMessage = { 
            role: 'user', 
            content, 
            timestamp: new Date().toISOString() 
        };
        messages = [...messages, userMessage];

        // Keep only last 10 messages
        if (messages.length > 10) {
            messages = messages.slice(-10);
        }

        await updateChatMutation.mutateAsync({
            id: chatId,
            data: { messages }
        });

        setIsLoading(true);

        try {
            // Detect if it's a code-related question
            const isCodeQuestion = /code|coding|programming|function|debug|bug|error|fix|refactor|optimi[sz]e|api|endpoint|http|rest|graphql|database|sql|query|schema|migration|algorithm|data\s*structure|class|method|variable|loop|array|object|component|hook|module|package|library|framework|react|next\.?js|vite|tailwind|shadcn|ui|design\s*system|css|html|javascript|typescript|python|java|rust|go|c\+\+|node\.?js|express|frontend|backend|devops|docker|kubernetes|test|jest|vitest|eslint|prettier|blog|landing\s*page|portfolio|dashboard|website|web\s*site|sayfa|tasarla|tasarım|oluştur|yap|kur|geliştir|navbar|hero|layout|grid|responsive|a11y|accessibility|seo|aritmetik|matematik|hesapla|calculate|equation|integral|derivative|probability|statistics/i.test(content);

            setCurrentMode(isCodeQuestion ? 'code' : 'search');
            let response = "";

            // Try using backend functions first, fallback to InvokeLLM if not enabled
            try {
                if (isCodeQuestion) {
                    const systemPrompt = `You are COFFEE, an elite senior software engineer and UI engineer.

Primary objective: produce production-ready, runnable solutions.

Hard rules:
- If the user asks to "build/create/design" something (e.g. "modern blog", "landing page", "dashboard"), you MUST output code (not just advice).
- Output must be copy-paste runnable: include a clear file/folder structure and then each file in a language-tagged code block.
- Do NOT use placeholders like "TODO" or "..." for core parts. Make reasonable assumptions and complete the implementation.
- Use Tailwind CSS for styling when relevant; aim for a smooth, premium, modern UI.
- Accessibility: semantic HTML, keyboard focus, contrast-safe colors.
- For math/arithmetics: compute carefully, show the calculation steps clearly, and include a final verified result.

Formatting:
- Use Markdown.
- Always use language-specific fenced code blocks (e.g., \`\`\`tsx, \`\`\`jsx, \`\`\`css).
- Reply in the same language the user writes in.`;

                    const contextMessages = messages.slice(-8).map(m => 
                        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
                    ).join('\n\n');

                    const fullPrompt = `${systemPrompt}\n\n${contextMessages}`;

                    const result = await base44.functions.callHuggingFace({
                        messages: fullPrompt,
                        max_tokens: 2048,
                        temperature: 0.7
                    });

                    if (result.success) {
                        response = result.response;
                    } else if (result.retry) {
                        toast.info("AI model is warming up...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        const retryResult = await base44.functions.callHuggingFace({
                            messages: fullPrompt,
                            max_tokens: 2048,
                            temperature: 0.7
                        });
                        if (retryResult.success) {
                            response = retryResult.response;
                        } else {
                            throw new Error("Backend functions not enabled");
                        }
                    } else {
                        throw new Error("Backend functions not enabled");
                    }
                } else {
                    const result = await base44.functions.webSearch({ query: content });
                    if (result.success) {
                        response = result.response;
                    } else {
                        throw new Error("Backend functions not enabled");
                    }
                }
            } catch (funcError) {
                // Fallback to InvokeLLM if backend functions not enabled
                console.log("Using fallback InvokeLLM");
                const systemPrompt = `You are COFFEE, an elite senior software engineer and UI engineer.

You MUST provide working code for build/design requests. Prefer complete file-based outputs.

Rules:
- Be concise but thorough.
- Use Markdown.
- Always use code blocks with language tags.
- For math/arithmetics: compute carefully and verify.
- Reply in the same language the user writes in.`;

                const contextMessages = messages.slice(-8).map(m => 
                    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
                ).join('\n\n');

                response = await base44.integrations.Core.InvokeLLM({
                    prompt: `${systemPrompt}\n\nConversation:\n${contextMessages}`,
                    add_context_from_internet: !isCodeQuestion,
                });
            }

            // Add assistant message
            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
                is_code: isCodeQuestion,
            };

            let updatedMessages = [...messages, assistantMessage];
            if (updatedMessages.length > 10) {
                updatedMessages = updatedMessages.slice(-10);
            }

            await updateChatMutation.mutateAsync({
                id: chatId,
                data: { messages: updatedMessages }
            });

            // Update usage
            await updateUsageMutation.mutateAsync('fast');

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle project actions
    const handleCreateProject = (data) => {
        if (editingProject) {
            updateProjectMutation.mutate({ id: editingProject.id, data });
        } else {
            createProjectMutation.mutate({
                ...data,
                last_activity: new Date().toISOString(),
            });
        }
    };

    const handleNewChat = () => {
        setSelectedChatId(null);
    };

    const handlePinChat = async (chat) => {
        await updateChatMutation.mutateAsync({
            id: chat.id,
            data: { is_pinned: !chat.is_pinned }
        });
    };

    const handleUpgrade = async () => {
        // In a real app, this would integrate with Stripe
        await base44.auth.updateMe({ plan: 'pro', plan_start_date: new Date().toISOString() });
        setUser({ ...user, plan: 'pro' });
        setUpgradeModalOpen(false);
        toast.success('Welcome to Pro! 🎉');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-full" />
                        <Coffee className="relative h-20 w-20 mx-auto text-amber-500" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
                        COFFEE
                    </h1>
                    <p className="text-zinc-400 mb-8">Your AI coding companion</p>
                    <Button
                        onClick={() => base44.auth.redirectToLogin()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-amber-500/25"
                    >
                        Sign in with Google
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-zinc-950 flex overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Coffee className="h-6 w-6 text-amber-500" />
                                    <span className="font-bold text-white">COFFEE</span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-zinc-400 hover:text-white md:hidden"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <Button
                                onClick={handleNewChat}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Chat
                            </Button>
                        </div>

                        {/* Scrollable Content */}
                        <ScrollArea className="flex-1">
                            <div className="py-4 space-y-6">
                                <ProjectList
                                    projects={projects}
                                    selectedProjectId={selectedProjectId}
                                    onSelectProject={(id) => {
                                        setSelectedProjectId(id === selectedProjectId ? null : id);
                                        setSelectedChatId(null);
                                    }}
                                    onCreateProject={() => {
                                        setEditingProject(null);
                                        setProjectModalOpen(true);
                                    }}
                                    onDeleteProject={(id) => deleteProjectMutation.mutate(id)}
                                    onRenameProject={(project) => {
                                        setEditingProject(project);
                                        setProjectModalOpen(true);
                                    }}
                                />

                                <div className="px-2">
                                    <div className="h-px bg-zinc-800" />
                                </div>

                                <ChatList
                                    chats={allChats}
                                    selectedChatId={selectedChatId}
                                    onSelectChat={setSelectedChatId}
                                    onDeleteChat={(id) => deleteChatMutation.mutate(id)}
                                    onPinChat={handlePinChat}
                                />
                            </div>
                        </ScrollArea>

                        {/* Usage & User */}
                        <div className="p-4 border-t border-zinc-800 space-y-4">
                            <UsageIndicator
                                usage={usage}
                                plan={user?.plan}
                                onUpgrade={() => setUpgradeModalOpen(true)}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                                        {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                    <span className="text-sm text-zinc-300 truncate max-w-[120px]">
                                        {user?.full_name || user?.email}
                                    </span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => base44.auth.logout()}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 border-b border-zinc-800 flex items-center px-4 gap-4 bg-zinc-900/50 backdrop-blur-lg">
                    {!sidebarOpen && (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSidebarOpen(true)}
                            className="text-zinc-400 hover:text-white"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="flex-1 flex items-center gap-3">
                        <div>
                            <h2 className="text-sm font-medium text-white truncate">
                                {selectedChat?.title || 'New Chat'}
                            </h2>
                            {selectedProjectId && (
                                <p className="text-xs text-zinc-500">
                                    {projects.find(p => p.id === selectedProjectId)?.name}
                                </p>
                            )}
                        </div>
                        {isLoading && <ModelIndicator isCodeMode={currentMode === 'code'} />}
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {selectedChat?.messages?.length > 0 ? (
                        <ScrollArea className="flex-1 p-4">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {selectedChat.messages.map((msg, i) => (
                                    <MessageBubble 
                                        key={i} 
                                        message={msg} 
                                        isPro={isPro}
                                    />
                                ))}
                                {isLoading && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    ) : (
                        <WelcomeScreen onSuggestionClick={handleSendMessage} />
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                        <div className="max-w-3xl mx-auto">
                            <ChatInput
                                onSend={handleSendMessage}
                                isLoading={isLoading}
                                disabled={false}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                onUpgrade={handleUpgrade}
                currentPlan={user?.plan}
            />

            <NewProjectModal
                isOpen={projectModalOpen}
                onClose={() => {
                    setProjectModalOpen(false);
                    setEditingProject(null);
                }}
                onSubmit={handleCreateProject}
                editProject={editingProject}
            />
        </div>
    );
}