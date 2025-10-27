import { create } from 'zustand'
import { LS } from './lib/storage'
import { api, USE_BACKEND } from './lib/api'

function uid(prefix='id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`; }

const DEMO_USER = {
  id: 'u_demo',
  name: 'Demo User',
  handle: 'u_demo',
  avatar: 'https://i.pravatar.cc/200?img=68',
  rank: 'BJJ Blue Belt',
  gym: 'DojoNet Academy',
  location: 'Los Angeles, CA',
  bio: 'Just a white belt on the path. OSS!',
  status: 'Training tonight 🥋',
};

// Seed demo journal entries
const seedDemoJournals = () => {
  const key = `journals_${DEMO_USER.id}`;
  if (localStorage.getItem(key)) return;
  
  const now = new Date();
  const entries = [
    {
      id: 'j_demo_1',
      userId: DEMO_USER.id,
      title: 'BJJ Class – Guard Retention',
      body: 'Drilled hip escapes, knee shields. Struggled vs pressure passing. Note to frame earlier.',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      journalMeta: {
        art: 'BJJ',
        sessionType: 'Class',
        durationMin: 90,
        techniques: ['Hip Escape', 'Knee Shield', 'Collar Tie'],
        mood: 'good',
        energy: 7,
        intensity: 6,
        recovery: 6,
        injured: false,
      },
    },
    {
      id: 'j_demo_2',
      userId: DEMO_USER.id,
      title: 'Open Mat – Sparring Rounds',
      body: '5x5 min. Caught armbar, got swept from half. Need underhook earlier.',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      journalMeta: {
        art: 'BJJ',
        sessionType: 'Sparring',
        durationMin: 60,
        techniques: ['Armbar', 'Half Guard Sweep Defense'],
        mood: 'neutral',
        energy: 6,
        intensity: 8,
        recovery: 5,
        injured: false,
      },
    },
  ];
  localStorage.setItem(key, JSON.stringify(entries));
};

const seedUsers = () => ([
  { id:'u_demo', name:'Demo User', rank:'Blue Belt', gym:'AMA Fight Club', location:'Los Angeles, CA',
    bio:'Just a white belt on the path. OSS!', status:'Training tonight 🥋',
    avatar:'https://i.pravatar.cc/200?img=68', banner:'', theme:'tatami',
    primaryArt: 'BJJ', beltSince: new Date('2024-01-15').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['playlist','posts','friends','stats'] },
    playlist:'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    friends:['u_jason', 'u_maria', 'u_lee', 'u_sarah', 'u_carlos', 'u_jordan', 'u_alex', 'u_nina'], 
    following:['u_jason', 'u_maria', 'u_lee', 'u_sarah', 'u_carlos', 'u_jordan', 'u_alex', 'u_nina', 'u_mike', 'u_emma'], 
    followers:['u_jason', 'u_maria', 'u_lee', 'u_sarah', 'u_carlos', 'u_jordan'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:2
  },
  { id:'u_jason', name:'Jason Doe', rank:'Purple Belt', gym:'Cobra MMA', location:'Los Angeles, CA',
    bio:'Flow like water. Student first.', status:'Training Muay Thai tonight',
    avatar:'https://i.pravatar.cc/200?img=12', banner:'', theme:'default',
    primaryArt: 'BJJ', beltSince: new Date('2023-06-10').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['playlist','posts','friends','stats'] },
    playlist:'https://cdn.pixabay.com/audio/2022/03/10/audio_c16b854ce0.mp3',
    friends:['u_demo', 'u_maria', 'u_carlos', 'u_jordan'], 
    following:['u_demo', 'u_maria', 'u_lee', 'u_carlos'], 
    followers:['u_demo', 'u_maria', 'u_sarah', 'u_nina'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:3
  },
  { id:'u_maria', name:'Maria Tan', rank:'Brown Belt', gym:'Eastside BJJ', location:'Seattle, WA',
    bio:'Grip fight, breathe, flow.', status:'No-gi tonight', avatar:'https://i.pravatar.cc/200?img=45', banner:'', theme:'iron',
    primaryArt: 'BJJ', beltSince: new Date('2022-11-20').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'',
    friends:['u_demo', 'u_jason', 'u_lee', 'u_alex'], 
    following:['u_demo', 'u_jason', 'u_lee', 'u_sarah'], 
    followers:['u_demo', 'u_jason', 'u_carlos', 'u_jordan'], 
    dojoCircle:[], comments:[], verifiedGym:true, rankLevel:4
  },
  { id:'u_lee', name:'Lee Park', rank:'Black Belt', gym:'Tiger Muay Thai', location:'NYC, NY',
    bio:'Kick low. Check high.', status:'Padwork 6am', avatar:'https://i.pravatar.cc/200?img=33', banner:'', theme:'neon',
    primaryArt: 'Muay Thai', beltSince: new Date('2021-03-15').toISOString(),
    layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] },
    playlist:'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe5c21c.mp3',
    friends:['u_demo', 'u_maria', 'u_mike'], 
    following:['u_demo', 'u_jason', 'u_maria'], 
    followers:['u_demo', 'u_jason', 'u_maria', 'u_emma'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:5
  },
  { id:'u_sarah', name:'Sarah Chen', rank:'White Belt', gym:'AMA Fight Club', location:'Los Angeles, CA',
    bio:'New to the game, excited to learn!', status:'First comp coming up!', avatar:'https://i.pravatar.cc/200?img=47', banner:'', theme:'tatami',
    primaryArt: 'BJJ', beltSince: new Date('2024-09-01').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'',
    friends:['u_demo', 'u_nina'], 
    following:['u_demo', 'u_jason', 'u_maria'], 
    followers:['u_demo', 'u_alex'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:1
  },
  { id:'u_carlos', name:'Carlos Silva', rank:'Purple Belt', gym:'Gracie Barra LA', location:'Los Angeles, CA',
    bio:'Pressure passing specialist', status:'Open mat Sunday!', avatar:'https://i.pravatar.cc/200?img=51', banner:'', theme:'iron',
    primaryArt: 'BJJ', beltSince: new Date('2023-03-22').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'',
    friends:['u_demo', 'u_jason', 'u_jordan'], 
    following:['u_demo', 'u_jason'], 
    followers:['u_demo', 'u_mike'], 
    dojoCircle:[], comments:[], verifiedGym:true, rankLevel:3
  },
  // New bot users
  { id:'u_jordan', name:'Jordan Rey', rank:'Blue Belt', gym:'10th Planet Jiu-Jitsu', location:'Los Angeles, CA',
    bio:'No-gi fanatic. Rubber guard for life.', status:'Rolling at 10th Planet tonight', 
    avatar:'https://i.pravatar.cc/200?img=15', banner:'', theme:'neon',
    primaryArt: 'BJJ', beltSince: new Date('2024-02-20').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
    friends:['u_demo', 'u_jason', 'u_carlos'], 
    following:['u_demo', 'u_jason', 'u_maria'], 
    followers:['u_demo', 'u_sarah'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:2
  },
  { id:'u_alex', name:'Alex Kim', rank:'Brown Belt', gym:'Alliance BJJ', location:'San Diego, CA',
    bio:'Competition is my meditation.', status:'Drilling takedowns', 
    avatar:'https://i.pravatar.cc/200?img=60', banner:'', theme:'default',
    primaryArt: 'BJJ', beltSince: new Date('2022-08-10').toISOString(),
    layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] },
    playlist:'',
    friends:['u_demo', 'u_maria', 'u_emma'], 
    following:['u_demo', 'u_lee'], 
    followers:['u_sarah', 'u_nina'], 
    dojoCircle:[], comments:[], verifiedGym:true, rankLevel:4
  },
  { id:'u_nina', name:'Nina Rodriguez', rank:'White Belt', gym:'AMA Fight Club', location:'Los Angeles, CA',
    bio:'Just started my journey. Loving every minute!', status:'First stripe soon!', 
    avatar:'https://i.pravatar.cc/200?img=25', banner:'', theme:'tatami',
    primaryArt: 'BJJ', beltSince: new Date('2024-10-01').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends'] },
    playlist:'',
    friends:['u_demo', 'u_sarah'], 
    following:['u_demo', 'u_jason', 'u_sarah'], 
    followers:['u_demo'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:1
  },
  { id:'u_mike', name:'Mike Thompson', rank:'Black Belt', gym:'Renzo Gracie LA', location:'Los Angeles, CA',
    bio:'Professor. 20+ years on the mat.', status:'Teaching fundamentals class', 
    avatar:'https://i.pravatar.cc/200?img=70', banner:'', theme:'iron',
    primaryArt: 'BJJ', beltSince: new Date('2015-12-15').toISOString(),
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'https://cdn.pixabay.com/audio/2022/02/28/audio_3af11ba26f.mp3',
    friends:['u_lee', 'u_carlos'], 
    following:['u_demo', 'u_maria'], 
    followers:['u_demo', 'u_jason', 'u_carlos', 'u_emma'], 
    dojoCircle:[], comments:[], verifiedGym:true, rankLevel:5
  },
  { id:'u_emma', name:'Emma Davis', rank:'Purple Belt', gym:'Atos Jiu-Jitsu', location:'San Diego, CA',
    bio:'Guard player. Always hunting for subs.', status:'Tournament prep mode', 
    avatar:'https://i.pravatar.cc/200?img=20', banner:'', theme:'neon',
    primaryArt: 'BJJ', beltSince: new Date('2023-04-18').toISOString(),
    layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] },
    playlist:'',
    friends:['u_alex'], 
    following:['u_demo', 'u_lee', 'u_alex'], 
    followers:['u_mike'], 
    dojoCircle:[], comments:[], verifiedGym:false, rankLevel:3
  },
]);

const seedPosts = () => [
  // Demo user posts (mix of feed and journals)
  { 
    id:'p_1', authorId:'u_demo', kind:'FEED', title:null, 
    body:'First week of blue belt in the books! Feeling humbled and motivated', 
    media:[], visibility:'PUBLIC', tags:['bjj','bluebell'], 
    createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(), 
    updatedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString(), 
    likesCount:12, commentsCount:3,
    likedBy: ['u_jason', 'u_mike', 'u_sarah', 'u_alex'],
    comments: [
      { id:'c_1', userId:'u_jason', text:'Congrats on the promotion!', createdAt: new Date(Date.now() - 1.5*24*60*60*1000).toISOString(), likedBy:['u_demo'], replies:[] },
      { id:'c_2', userId:'u_sarah', text:'Blue belt journey is amazing, enjoy it!', createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(), likedBy:['u_demo', 'u_jason'], replies:[
        { id:'c_2_r_1', userId:'u_demo', text:'Thanks! Any tips?', createdAt: new Date(Date.now() - 0.5*24*60*60*1000).toISOString() }
      ]},
      { id:'c_3', userId:'u_mike', text:'Well deserved! 🥋', createdAt: new Date(Date.now() - 0.8*24*60*60*1000).toISOString(), likedBy:[], replies:[] }
    ]
  },
  { 
    id:'p_2', authorId:'u_demo', kind:'JOURNAL', title:'White Belt Finale', 
    body:'Last class as a white belt. Rolled with everyone and felt the difference from day one. Ready for blue!', 
    media:[{type:'image',url:'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',thumbUrl:'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400'}], 
    visibility:'PRIVATE', tags:['bjj','promotion'], 
    journalMeta:{art:'BJJ',sessionType:'Class',durationMin:90,techniques:['guard passing','mount escapes'],mood:'excited',chapterId:'ch_demo_white'}, 
    createdAt: new Date(Date.now() - 10*24*60*60*1000).toISOString(), 
    updatedAt: new Date(Date.now() - 10*24*60*60*1000).toISOString(), 
    likesCount:0, commentsCount:0,
    likedBy: [],
    comments: []
  },
  { 
    id:'p_3', authorId:'u_demo', kind:'JOURNAL', title:'Triangle Breakthrough', 
    body:'Finally hit my first triangle in live rolling! Coach showed me the angle adjustment and it clicked.', 
    media:[], visibility:'FRIENDS', tags:['bjj','triangle','submission'], 
    journalMeta:{art:'BJJ',sessionType:'Sparring',durationMin:60,techniques:['triangle choke','closed guard'],mood:'accomplished',chapterId:'ch_demo_white'}, 
    createdAt: new Date(Date.now() - 45*24*60*60*1000).toISOString(), 
    updatedAt: new Date(Date.now() - 45*24*60*60*1000).toISOString(), 
    likesCount:5, commentsCount:2,
    likedBy: ['u_jason', 'u_mike'],
    comments: [
      { id:'c_4', userId:'u_mike', text:'Nice! Triangles are such a game changer', createdAt: new Date(Date.now() - 44*24*60*60*1000).toISOString(), likedBy:['u_demo'], replies:[] },
      { id:'c_5', userId:'u_jason', text:'The angle is everything with triangles', createdAt: new Date(Date.now() - 43*24*60*60*1000).toISOString(), likedBy:[], replies:[] }
    ]
  },
  
  // Jason's posts
  { 
    id:'p_4', authorId:'u_jason', kind:'FEED', title:null, 
    body:'That feeling when you finally understand the cross collar choke mechanics', 
    media:[{type:'image',url:'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800',thumbUrl:'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400'}], 
    visibility:'PUBLIC', tags:['bjj','technique'], 
    createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(), 
    updatedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(), 
    likesCount:24, commentsCount:7,
    likedBy: ['u_demo', 'u_sarah', 'u_mike'],
    comments: [
      { id:'c_6', userId:'u_demo', text:'So satisfying when it clicks!', createdAt: new Date(Date.now() - 0.9*24*60*60*1000).toISOString(), likedBy:['u_jason'], replies:[] },
      { id:'c_7', userId:'u_sarah', text:'Best fundamental choke in the game', createdAt: new Date(Date.now() - 0.7*24*60*60*1000).toISOString(), likedBy:['u_jason', 'u_demo'], replies:[] }
    ]
  },
  { id:'p_5', authorId:'u_jason', kind:'FEED', title:null, body:'Open mat this Saturday 10am! All levels welcome', media:[], visibility:'PUBLIC', tags:['training','openmat'], createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 3*24*60*60*1000).toISOString(), likesCount:18, commentsCount:5 },
  
  // Maria's posts
  { id:'p_6', authorId:'u_maria', kind:'FEED', title:null, body:'Competed today and took silver! The matches were tough but I learned so much. Already planning adjustments for next time.', media:[{type:'image',url:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',thumbUrl:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'},{type:'image',url:'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',thumbUrl:'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400'}], visibility:'PUBLIC', tags:['competition','bjj','silver'], createdAt: new Date(Date.now() - 4*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 4*24*60*60*1000).toISOString(), likesCount:45, commentsCount:12 },
  { id:'p_7', authorId:'u_maria', kind:'JOURNAL', title:'Comp Prep', body:'Final drilling session before tomorrow. Feeling ready. Game plan: pressure pass, take the back, finish with RNC.', media:[], visibility:'PRIVATE', tags:['bjj','competition','prep'], journalMeta:{art:'BJJ',sessionType:'Drill',durationMin:120,techniques:['pressure passing','back take','RNC'],mood:'focused',chapterId:'ch_maria_brown'}, createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 5*24*60*60*1000).toISOString(), likesCount:0, commentsCount:0 },
  
  // Lee's posts
  { id:'p_8', authorId:'u_lee', kind:'FEED', title:null, body:'Morning padwork done. Nothing beats that 6am training high', media:[], visibility:'PUBLIC', tags:['muaythai','training'], createdAt: new Date(Date.now() - 6*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 6*60*60*1000).toISOString(), likesCount:31, commentsCount:4 },
  
  // Sarah's posts
  { id:'p_9', authorId:'u_sarah', kind:'FEED', title:null, body:'Three months in and I am hooked! Cannot believe how much I have learned already', media:[], visibility:'PUBLIC', tags:['bjj','beginner','whitebelt'], createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(), likesCount:19, commentsCount:8 },
  
  // Carlos's posts
  { id:'p_10', authorId:'u_carlos', kind:'FEED', title:null, body:'Teaching the fundamentals class tonight. Come through if you want to work on your passing game!', media:[], visibility:'PUBLIC', tags:['bjj','teaching','passing'], createdAt: new Date(Date.now() - 8*24*60*60*1000).toISOString(), updatedAt: new Date(Date.now() - 8*24*60*60*1000).toISOString(), likesCount:22, commentsCount:6 },
];

const seedChapters = () => [
  { id:'ch_demo_white', userId:'u_demo', title:'White Belt Journey', startedAt: new Date('2023-08-01').toISOString(), endedAt: new Date('2024-01-15').toISOString(), orderIndex:1 },
  { id:'ch_demo_blue', userId:'u_demo', title:'Blue Belt', startedAt: new Date('2024-01-15').toISOString(), endedAt: null, orderIndex:2 },
  { id:'ch_maria_brown', userId:'u_maria', title:'Brown Belt', startedAt: new Date('2022-11-20').toISOString(), endedAt: null, orderIndex:3 },
];

const seedDrafts = () => [
  { id:'d_1', authorId:'u_demo', kind:'FEED', payload:{body:'Thinking about competition prep... should I?',visibility:'PUBLIC'}, updatedAt: new Date(Date.now() - 3*60*60*1000).toISOString(), createdAt: new Date(Date.now() - 3*60*60*1000).toISOString() },
  { id:'d_2', authorId:'u_demo', kind:'JOURNAL', payload:{body:'Todays drilling session notes...',visibility:'PRIVATE',journal:{art:'BJJ',sessionType:'Drill'}}, updatedAt: new Date(Date.now() - 1*60*60*1000).toISOString(), createdAt: new Date(Date.now() - 1*60*60*1000).toISOString() },
];

const initialUsers = LS.get('users', seedUsers());
const initialPosts = LS.get('posts', seedPosts());
const initialChapters = LS.get('chapters', seedChapters());
const initialDrafts = LS.get('drafts', seedDrafts());
const initialSession = LS.get('session', { userId: null });

export const useStore = create((set, get) => ({
  users: initialUsers,
  posts: initialPosts,
  chapters: initialChapters,
  drafts: initialDrafts,
  session: initialSession,
  conversations: LS.get('conversations') || [],
  messages: LS.get('messages') || [],

  // permission logic: 1=White,2=Blue,3=Purple,4=Brown,5=Black,6=Coach
  canTeach(rankLevel, verifiedGym){ return (rankLevel>=5) || !!verifiedGym; },

  // auth
  login(nameLike){
    const user = get().users.find(u => u.name.toLowerCase().includes(String(nameLike).toLowerCase()));
    if(user){
      const session = { userId: user.id };
      set({ session }); LS.set('session', session);
      return { ok:true, user };
    }
    return { ok:false, message:'User not found. Try Sign Up.' };
  },
  logout(){
    const session = { userId: null };
    set({ session }); LS.set('session', session);
  },
  async loginAsDemo(){
    // Load demo data from static file
    try {
      const res = await fetch('/DojoNet-Prototype-MAX/demo-data.json');
      const demoData = await res.json();
      // Seed users
      localStorage.setItem('users', JSON.stringify(demoData.users));
      // Seed journals
      localStorage.setItem('journals_u_demo', JSON.stringify(demoData.journals));
      // Seed techniques
      localStorage.setItem('techniques_u_demo', JSON.stringify(demoData.techniques));
      // Seed goals
      localStorage.setItem('goals_u_demo', JSON.stringify(demoData.goals));
      // Seed sparring
      localStorage.setItem('sparring_u_demo', JSON.stringify(demoData.sparring));
      // Seed partners
      localStorage.setItem('partners_u_demo', JSON.stringify(demoData.partners));
    } catch (e) {
      // fallback to legacy seed if fetch fails
      seedDemoJournals();
    }
    const session = { userId: DEMO_USER.id };
    localStorage.setItem('session', JSON.stringify(session));
    set({ session }); 
    LS.set('session', session);
    return { ok: true, user: DEMO_USER };
  },
  signUp({ name, location }){
    const id = uid('u');
    const user = { id, name, rank:'White Belt', gym:'', location, bio:'', status:'',
      avatar:`https://i.pravatar.cc/200?u=${id}`, banner:'', theme:'tatami',
      primaryArt: 'BJJ', beltSince: new Date().toISOString(),
      layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats','wall'] },
      playlist:'', friends:[], following:[], followers:[], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:1
    };
    const users = [...get().users, user];
    set({ users }); LS.set('users', users);
    
    // Create initial chapter for new user
    const chapterId = uid('ch');
    const chapter = { id:chapterId, userId:id, title:'White Belt Journey', startedAt: new Date().toISOString(), endedAt:null, orderIndex:1 };
    const chapters = [...get().chapters, chapter];
    set({ chapters }); LS.set('chapters', chapters);
    
    const session = { userId: id }; set({ session }); LS.set('session', session);
    if(USE_BACKEND){ api('POST','/users', user).catch(()=>{}); }
    return user;
  },

  // updates
  updateUser(id, patch){
    const users = get().users.map(u => u.id===id ? { ...u, ...patch } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('PATCH', `/users/${id}`, patch).catch(()=>{}); }
  },

  // Posts & Journals
  createPost({ kind='FEED', title, body, media=[], visibility='PUBLIC', tags=[], journal }){
    const authorId = get().session.userId;
    if(!authorId) return;
    
    const id = uid('p');
    const now = new Date().toISOString();
    const post = {
      id, authorId, kind, title, body, media, visibility, tags,
      createdAt: now, updatedAt: now,
      likesCount: 0, commentsCount: 0
    };
    
    if(kind === 'JOURNAL' && journal){
      // Ensure there's an active chapter
      const activeChapter = get().chapters.find(ch => ch.userId === authorId && !ch.endedAt);
      const chapterId = activeChapter?.id || get().ensureChapter(authorId);
      post.journalMeta = { ...journal, chapterId };
    }
    
    const posts = [post, ...get().posts];
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST','/posts', post).catch(()=>{}); }
    return post;
  },

  updatePost(postId, patch){
    const posts = get().posts.map(p => p.id===postId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p);
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('PATCH', `/posts/${postId}`, patch).catch(()=>{}); }
  },

  deletePost(postId){
    const posts = get().posts.filter(p => p.id !== postId);
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('DELETE', `/posts/${postId}`).catch(()=>{}); }
  },

  likePost(postId){
    const posts = get().posts.map(p => p.id===postId ? { ...p, likesCount: p.likesCount + 1 } : p);
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST', `/posts/${postId}/like`).catch(()=>{}); }
  },

  // Toggle like on post (proper implementation with likedBy tracking)
  toggleLike(postId){
    const userId = get().session.userId;
    if (!userId) return;
    
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p;
      
      const likedBy = p.likedBy || [];
      const hasLiked = likedBy.includes(userId);
      
      return {
        ...p,
        likedBy: hasLiked 
          ? likedBy.filter(id => id !== userId)
          : [...likedBy, userId],
        likesCount: hasLiked ? p.likesCount - 1 : p.likesCount + 1
      };
    });
    
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST', `/posts/${postId}/like`).catch(()=>{}); }
  },

  // Add comment to post
  addComment(postId, text){
    const userId = get().session.userId;
    if (!userId || !text.trim()) return;
    
    const commentId = uid('comment');
    const comment = {
      id: commentId,
      userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likedBy: [],
      likesCount: 0,
      replies: []
    };
    
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p;
      
      return {
        ...p,
        comments: [...(p.comments || []), comment],
        commentsCount: (p.commentsCount || 0) + 1
      };
    });
    
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST', `/posts/${postId}/comments`, comment).catch(()=>{}); }
  },

  // Toggle like on comment
  toggleCommentLike(postId, commentId){
    const userId = get().session.userId;
    if (!userId) return;
    
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p;
      
      const comments = (p.comments || []).map(c => {
        if (c.id !== commentId) return c;
        
        const likedBy = c.likedBy || [];
        const hasLiked = likedBy.includes(userId);
        
        return {
          ...c,
          likedBy: hasLiked 
            ? likedBy.filter(id => id !== userId)
            : [...likedBy, userId],
          likesCount: hasLiked ? (c.likesCount || 0) - 1 : (c.likesCount || 0) + 1
        };
      });
      
      return { ...p, comments };
    });
    
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST', `/posts/${postId}/comments/${commentId}/like`).catch(()=>{}); }
  },

  // Add reply to comment
  addReply(postId, commentId, text){
    const userId = get().session.userId;
    if (!userId || !text.trim()) return;
    
    const replyId = uid('reply');
    const reply = {
      id: replyId,
      userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likedBy: [],
      likesCount: 0
    };
    
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p;
      
      const comments = (p.comments || []).map(c => {
        if (c.id !== commentId) return c;
        
        return {
          ...c,
          replies: [...(c.replies || []), reply]
        };
      });
      
      return { ...p, comments };
    });
    
    set({ posts }); LS.set('posts', posts);
    if(USE_BACKEND){ api('POST', `/posts/${postId}/comments/${commentId}/replies`, reply).catch(()=>{}); }
  },

  // Chapters (for journal organization)
  ensureChapter(userId){
    const chapters = get().chapters.filter(ch => ch.userId === userId);
    let active = chapters.find(ch => !ch.endedAt);
    if(!active){
      const id = uid('ch');
      const user = get().users.find(u => u.id === userId);
      active = { 
        id, userId, 
        title: user?.rank ? `${user.rank} Journey` : 'Getting Started', 
        startedAt: new Date().toISOString(), 
        endedAt: null, 
        orderIndex: chapters.length + 1 
      };
      const newChapters = [...get().chapters, active];
      set({ chapters: newChapters }); LS.set('chapters', newChapters);
    }
    return active.id;
  },

  rankUp(userId, newRank, art){
    const now = new Date().toISOString();
    
    // Close current chapter
    const chapters = get().chapters.map(ch => 
      ch.userId === userId && !ch.endedAt ? { ...ch, endedAt: now } : ch
    );
    
    // Create new chapter
    const userChapters = chapters.filter(ch => ch.userId === userId);
    const orderIndex = Math.max(...userChapters.map(ch => ch.orderIndex), 0) + 1;
    const newChapterId = uid('ch');
    const newChapter = {
      id: newChapterId,
      userId,
      title: newRank,
      startedAt: now,
      endedAt: null,
      orderIndex
    };
    
    const updatedChapters = [...chapters, newChapter];
    set({ chapters: updatedChapters }); LS.set('chapters', updatedChapters);
    
    // Update user rank
    const rankLevels = { 'White Belt':1, 'Blue Belt':2, 'Purple Belt':3, 'Brown Belt':4, 'Black Belt':5 };
    get().updateUser(userId, { 
      rank: newRank, 
      primaryArt: art || undefined, 
      beltSince: now,
      rankLevel: rankLevels[newRank] || 1
    });
    
    if(USE_BACKEND){ api('POST', '/profile/rank', { rank: newRank, art }).catch(()=>{}); }
    return newChapterId;
  },

  // Drafts
  saveDraft({ kind='FEED', payload }){
    const authorId = get().session.userId;
    if(!authorId) return;
    
    const existing = get().drafts.find(d => d.authorId === authorId && d.kind === kind);
    if(existing){
      const drafts = get().drafts.map(d => 
        d.id === existing.id ? { ...d, payload, updatedAt: new Date().toISOString() } : d
      );
      set({ drafts }); LS.set('drafts', drafts);
    } else {
      const id = uid('d');
      const now = new Date().toISOString();
      const draft = { id, authorId, kind, payload, createdAt: now, updatedAt: now };
      const drafts = [draft, ...get().drafts];
      set({ drafts }); LS.set('drafts', drafts);
    }
  },

  deleteDraft(draftId){
    const drafts = get().drafts.filter(d => d.id !== draftId);
    set({ drafts }); LS.set('drafts', drafts);
  },

  // Feed (get posts from user + following)
  getFeed(userId){
    const user = get().users.find(u => u.id === userId);
    if(!user) return [];
    
    const followingIds = [...user.following, userId]; // Include own posts
    return get().posts
      .filter(p => {
        // Must be from following
        if(!followingIds.includes(p.authorId)) return false;
        // Check visibility
        if(p.visibility === 'PUBLIC') return true;
        if(p.visibility === 'PRIVATE' && p.authorId === userId) return true;
        if(p.visibility === 'FRIENDS' && (p.authorId === userId || user.friends.includes(p.authorId))) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get journals for a user
  getJournals(userId, filters={}){
    let journals = get().posts.filter(p => p.authorId === userId && p.kind === 'JOURNAL');
    
    if(filters.chapterId){
      journals = journals.filter(j => j.journalMeta?.chapterId === filters.chapterId);
    }
    if(filters.art){
      journals = journals.filter(j => j.journalMeta?.art === filters.art);
    }
    if(filters.sessionType){
      journals = journals.filter(j => j.journalMeta?.sessionType === filters.sessionType);
    }
    
    return journals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Legacy methods (kept for compatibility)
  addPost(id, title, type='note'){
    // Convert to new post system
    get().createPost({ kind:'FEED', body:title, visibility:'PUBLIC', tags:[type] });
  },

  follow(meId, targetId){
    if(meId===targetId) return;
    const users = get().users.map(u => {
      if(u.id===meId && !u.following.includes(targetId)) return { ...u, following:[...u.following, targetId] };
      if(u.id===targetId && !u.followers.includes(meId)) return { ...u, followers:[...u.followers, meId] };
      return u;
    });
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('POST','/follow',{ meId, targetId }).catch(()=>{}); }
  },

  comment(targetUserId, text){
    const entry = { id: uid('c'), userId: get().session.userId, text, ts: Date.now() };
    const users = get().users.map(u => u.id===targetUserId ? { ...u, comments:[entry, ...u.comments] } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('POST','/comment',{ targetUserId, authorId: entry.userId, text, ts: entry.ts }).catch(()=>{}); }
  },

  setTop8(userId, list){
    const users = get().users.map(u => u.id===userId ? { ...u, dojoCircle: list.slice(0,8) } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('PATCH', `/users/${userId}`, { dojoCircle: list.slice(0,8) }).catch(()=>{}); }
  },

  toggleVerified(userId){
    const users = get().users.map(u => u.id===userId ? { ...u, verifiedGym: !u.verifiedGym } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ const user = users.find(u=>u.id===userId); api('POST','/verify',{ userId, verifiedGym: user.verifiedGym }).catch(()=>{}); }
  },

  setRankLevel(userId, lvl){
    const users = get().users.map(u => u.id===userId ? { ...u, rankLevel: lvl } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('POST','/verify',{ userId, rankLevel: lvl }).catch(()=>{}); }
  },

  reorderLayout(id, layout){
    const users = get().users.map(u => u.id===id ? { ...u, layout } : u);
    set({ users }); LS.set('users', users);
    if(USE_BACKEND){ api('PATCH', `/users/${id}`, { layout }).catch(()=>{}); }
  },

  // === MESSAGING SYSTEM ===
  
  // Get or create conversation between two users
  getOrCreateConversation(userId1, userId2) {
    const conversations = get().conversations
    const existing = conversations.find(
      c => (c.participants.includes(userId1) && c.participants.includes(userId2))
    )
    
    if (existing) return existing.id
    
    const newConversation = {
      id: uid('conv'),
      participants: [userId1, userId2],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const updated = [...conversations, newConversation]
    set({ conversations: updated })
    LS.set('conversations', updated)
    return newConversation.id
  },
  
  // Send message
  sendMessage(conversationId, text) {
    const senderId = get().session.userId
    if (!senderId || !text.trim()) return null
    
    const message = {
      id: uid('msg'),
      conversationId,
      senderId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    
    const messages = [...get().messages, message]
    const conversations = get().conversations.map(c =>
      c.id === conversationId
        ? { ...c, updatedAt: message.timestamp, lastMessage: text.trim() }
        : c
    )
    
    set({ messages, conversations })
    LS.set('messages', messages)
    LS.set('conversations', conversations)
    
    if (USE_BACKEND) {
      api('POST', '/messages', message).catch(() => {})
    }
    
    return message
  },
  
  // Get messages for a conversation
  getConversationMessages(conversationId) {
    return get().messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  },
  
  // Get user's conversations
  getUserConversations(userId) {
    return get().conversations
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },
  
  // Mark messages as read
  markMessagesAsRead(conversationId, userId) {
    const messages = get().messages.map(m =>
      m.conversationId === conversationId && m.senderId !== userId
        ? { ...m, read: true }
        : m
    )
    set({ messages })
    LS.set('messages', messages)
  },
  
  // Get unread count for a conversation
  getUnreadCount(conversationId, userId) {
    return get().messages.filter(
      m => m.conversationId === conversationId && m.senderId !== userId && !m.read
    ).length
  },
  
  // Delete conversation
  deleteConversation(conversationId) {
    const conversations = get().conversations.filter(c => c.id !== conversationId)
    const messages = get().messages.filter(m => m.conversationId !== conversationId)
    set({ conversations, messages })
    LS.set('conversations', conversations)
    LS.set('messages', messages)
    
    if (USE_BACKEND) {
      api('DELETE', `/conversations/${conversationId}`).catch(() => {})
    }
  },

  // === EVENT INTERACTION SYSTEM ===
  
  // Get or create event RSVPs storage
  getEventRSVPs() {
    return LS.get('eventRSVPs') || {}
  },
  
  // RSVP to event
  rsvpToEvent(eventId, status) {
    const userId = get().session.userId
    if (!userId) return
    
    const rsvps = get().getEventRSVPs()
    if (!rsvps[eventId]) rsvps[eventId] = {}
    
    rsvps[eventId][userId] = {
      status, // 'going' | 'interested' | 'not_going'
      timestamp: new Date().toISOString()
    }
    
    LS.set('eventRSVPs', rsvps)
    
    if (USE_BACKEND) {
      api('POST', '/events/rsvp', { eventId, userId, status }).catch(() => {})
    }
  },
  
  // Get RSVP status for event
  getEventRSVP(eventId) {
    const userId = get().session.userId
    if (!userId) return null
    
    const rsvps = get().getEventRSVPs()
    return rsvps[eventId]?.[userId]?.status || null
  },
  
  // Get RSVP counts for event
  getEventRSVPCounts(eventId) {
    const rsvps = get().getEventRSVPs()
    const eventRSVPs = rsvps[eventId] || {}
    
    return {
      going: Object.values(eventRSVPs).filter(r => r.status === 'going').length,
      interested: Object.values(eventRSVPs).filter(r => r.status === 'interested').length,
      notGoing: Object.values(eventRSVPs).filter(r => r.status === 'not_going').length
    }
  },
  
  // Add event comment
  addEventComment(eventId, text) {
    const userId = get().session.userId
    if (!userId || !text.trim()) return null
    
    const comments = LS.get('eventComments') || {}
    if (!comments[eventId]) comments[eventId] = []
    
    const comment = {
      id: uid('ec'),
      eventId,
      userId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      likes: []
    }
    
    comments[eventId].unshift(comment)
    LS.set('eventComments', comments)
    
    if (USE_BACKEND) {
      api('POST', '/events/comments', comment).catch(() => {})
    }
    
    return comment
  },
  
  // Get event comments
  getEventComments(eventId) {
    const comments = LS.get('eventComments') || {}
    return comments[eventId] || []
  },
  
  // Like event comment
  likeEventComment(eventId, commentId) {
    const userId = get().session.userId
    if (!userId) return
    
    const comments = LS.get('eventComments') || {}
    if (!comments[eventId]) return
    
    comments[eventId] = comments[eventId].map(c => {
      if (c.id === commentId) {
        const likes = c.likes || []
        if (likes.includes(userId)) {
          return { ...c, likes: likes.filter(id => id !== userId) }
        } else {
          return { ...c, likes: [...likes, userId] }
        }
      }
      return c
    })
    
    LS.set('eventComments', comments)
  },
  
  // Share event with friends
  shareEvent(eventId, friendIds, message) {
    const userId = get().session.userId
    if (!userId) return
    
    const shares = LS.get('eventShares') || []
    
    const share = {
      id: uid('es'),
      eventId,
      sharedBy: userId,
      sharedWith: friendIds,
      message: message || '',
      timestamp: new Date().toISOString()
    }
    
    shares.push(share)
    LS.set('eventShares', shares)
    
    // Create notifications for shared friends
    friendIds.forEach(friendId => {
      const notifications = LS.get(`notifications_${friendId}`) || []
      notifications.unshift({
        id: uid('notif'),
        type: 'event_share',
        userId: userId,
        eventId: eventId,
        message: `shared an event with you${message ? ': ' + message : ''}`,
        createdAt: new Date().toISOString(),
        read: false
      })
      LS.set(`notifications_${friendId}`, notifications.slice(0, 100))
    })
    
    if (USE_BACKEND) {
      api('POST', '/events/share', share).catch(() => {})
    }
    
    return share
  },
  
  // Set event reminder
  setEventReminder(eventId, reminderTime) {
    const userId = get().session.userId
    if (!userId) return
    
    const reminders = LS.get('eventReminders') || {}
    if (!reminders[userId]) reminders[userId] = {}
    
    reminders[userId][eventId] = {
      reminderTime, // timestamp when to remind
      eventId,
      createdAt: new Date().toISOString()
    }
    
    LS.set('eventReminders', reminders)
  },
  
  // Get user's event reminders
  getUserEventReminders() {
    const userId = get().session.userId
    if (!userId) return []
    
    const reminders = LS.get('eventReminders') || {}
    return Object.values(reminders[userId] || {})
  },
  
  // Remove event reminder
  removeEventReminder(eventId) {
    const userId = get().session.userId
    if (!userId) return
    
    const reminders = LS.get('eventReminders') || {}
    if (reminders[userId]) {
      delete reminders[userId][eventId]
      LS.set('eventReminders', reminders)
    }
  },
}))

// On module load, try pulling from backend to replace local seed
;(async () => {
  try{
    if(USE_BACKEND){
      const users = await api('GET','/users')
      if(Array.isArray(users) && users.length){
        useStore.setState({ users })
        LS.set('users', users)
      }
    }
  }catch(e){ console.warn('Backend not reachable:', e?.message) }
})()
