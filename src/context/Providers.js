import { AccountLoginProvider } from '../context/AccountLoginContext';
import { SocketNotificationProvider } from '../context/SocketNotificationContext';
import { SocketMessagesProvider } from '../context/SocketMessagesContext';
import { PermissionDetailProvider } from '../context/PermissionDetailContext';
import { SRAndThesisJoinProvider } from '../context/SRAndThesisJoinContext';
import { MenuProvider } from '../context/MenuContext';
import { ModalProvider } from './ModalContext';

const Providers = ({ children }) => (
    <AccountLoginProvider>
        <PermissionDetailProvider>
            <MenuProvider>
                <ModalProvider>
                    <SRAndThesisJoinProvider>
                        <SocketNotificationProvider>
                            <SocketMessagesProvider>
                                {children}
                            </SocketMessagesProvider>
                        </SocketNotificationProvider>
                    </SRAndThesisJoinProvider>
                </ModalProvider>
            </MenuProvider>
        </PermissionDetailProvider>
    </AccountLoginProvider>
);

export default Providers;
