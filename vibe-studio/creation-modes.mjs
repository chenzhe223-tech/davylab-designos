export const CREATION_MODES=Object.freeze({
 animation:{title:'一句话生成动画',guidance:'以程序化动画表达创意。明确可执行的视觉运动、镜头节奏和画面元素。',sample:[{title:'创意出现',duration:5,visual:'星光粒子缓缓汇聚'},{title:'画面生长',duration:5,visual:'几何城市结构从光线中浮现'},{title:'动画完成',duration:5,visual:'镜头推近光之城的天际线'}]},
 knowledge:{title:'知识可视化视频',guidance:'以事实准确为优先。把概念分解为可核验的知识步骤和可视化镜头，避免凭空补充事实。',sample:[{title:'提出问题',duration:5,visual:'星球与轨道构成概念示意'},{title:'逐层解释',duration:5,visual:'数据结构与粒子连接成知识图形'},{title:'归纳总结',duration:5,visual:'关键关系依次突出，形成完整图解'}]},
 story:{title:'故事动画导演',guidance:'突出人物行动、故事起承转合和镜头连续性，角色名称和场景保持一致。',sample:[{title:'故事开场',duration:5,visual:'山谷远景建立故事世界'},{title:'冲突发展',duration:5,visual:'城市街道中的角色遇到挑战'},{title:'故事收束',duration:5,visual:'云海尽头出现新的旅程'}]},
 brand:{title:'产品与品牌宣传片',guidance:'突出真实产品特征、价值主张、视觉一致性及商业镜头语言，不捏造产品功能。',sample:[{title:'品牌亮相',duration:5,visual:'粒子勾勒品牌标识轮廓'},{title:'核心特性',duration:5,visual:'产品细节与结构动态展示'},{title:'行动收束',duration:5,visual:'品牌名称与信息清晰定格'}]}
});
export const normalizeCreationMode=value=>Object.hasOwn(CREATION_MODES,value)?value:'animation';
export const modeDescription=value=>CREATION_MODES[normalizeCreationMode(value)];
export const demoShotsForMode=value=>modeDescription(value).sample.map(shot=>({...shot}));
