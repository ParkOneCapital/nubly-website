export type VideoList = {
  name: string;
  videoSource: string;
  isClicked: boolean;
};

export const videoList: VideoList[] = [
  {
    name: 'Sign up for an account',
    videoSource: '/assets/videos/nubly_user_onboarding.mp4',
    isClicked: false,
  },
  {
    name: 'Savings goals',
    videoSource: '/assets/videos/nubly_fund_goal.mp4',
    isClicked: false,
  },
  {
    name: 'Investment goals',
    videoSource: '/assets/videos/nubly_onboard_portfolio.mp4',
    isClicked: false,
  },
  {
    name: 'General chat',
    videoSource: '/assets/videos/general_chat.m4v',
    isClicked: false,
  },
  {
    name: 'Savings goal using chat',
    videoSource: '/assets/videos/savings_chat.m4v',
    isClicked: false,
  },
  {
    name: 'Investing goal using chat',
    videoSource: '/assets/videos/investing_chat.m4v',
    isClicked: false,
  },
];
