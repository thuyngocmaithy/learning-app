import { AccountLoginProvider } from '../context/AccountLoginContext';
import { SocketNotificationProvider } from '../context/SocketNotificationContext';
import { SocketMessagesProvider } from '../context/SocketMessagesContext';
import { PermissionDetailProvider } from '../context/PermissionDetailContext';
import { SRAndThesisJoinProvider } from '../context/SRAndThesisJoinContext';
import { MenuProvider } from '../context/MenuContext';

const Providers = ({ children }) => (
    <AccountLoginProvider>
        <PermissionDetailProvider>
            <MenuProvider>
                <SRAndThesisJoinProvider>
                    <SocketNotificationProvider>
                        <SocketMessagesProvider>
                            {children}
                        </SocketMessagesProvider>
                    </SocketNotificationProvider>
                </SRAndThesisJoinProvider>
            </MenuProvider>
        </PermissionDetailProvider>
    </AccountLoginProvider>
);

export default Providers;
