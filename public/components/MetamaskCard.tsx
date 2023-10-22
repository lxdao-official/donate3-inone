import {
  NotifiSubscriptionCard,
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from '@notifi-network/notifi-react-card';
import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useXmtpStore } from "./xmtp";

import '@notifi-network/notifi-react-card/dist/index.css';

import { BellButton } from './BellButton';

export const MetamaskCard = () => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const { alerts } = useNotifiSubscriptionContext();
  const { client } = useNotifiClientContext();
  const { address } = useAccount();
  const { conversations } = useXmtpStore();

  // helper function 
  const buildContentTopic = (name: string): string => `/xmtp/0/${name}/proto`;

  const buildUserInviteTopic = useCallback((): string => {
    return buildContentTopic(`invite-${address}`);
  }, [address]);

  const buildUserIntroTopic = useCallback((): string => {
    return buildContentTopic(`intro-${address}`);
  }, [address]);

  // this is the object we will pass as input reference
  let topics = useMemo<string[]>(
    () => [buildUserInviteTopic(), buildUserIntroTopic()],
    [buildUserIntroTopic, buildUserInviteTopic],
  );

  const addTopic = (topicName: string) => {
    if (!topics.includes(topicName)) {
      topics.push(topicName);
    }
  };

  conversations.forEach((c) => {
    addTopic(c.topic);
  });

  return (
    <>
      {address && (
        <div>
          {/* <h1>Notifi Card: Metamask</h1> */}
          {/* <h3>Subscribing Alert(s)</h3> */}
          {/* {client.isInitialized && client.isAuthenticated ? (
            <div>
              <ul>
                {Object.keys(alerts).length > 0 &&
                  Object.keys(alerts).map((alert) => (
                    <li key={alerts[alert]?.id}>
                      <div>{alerts[alert]?.name}</div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div>Not yet register Notification</div>
          )} */}
          <BellButton setIsCardOpen={setIsCardOpen} />
          {isCardOpen ? (
            <NotifiSubscriptionCard
              darkMode
              inputs={{ XMTPTopics: topics }}
              cardId="2b359c101cab48089e67fc0be580fade"
              onClose={() => setIsCardOpen(false)}
            />
          ) : null}
        </div>
      )}
    </>
  );
};
