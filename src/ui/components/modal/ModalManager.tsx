const STATE_MODAL_OPENED = "MODAL_OPENED";
export enum ModalManagerCloseReason {
    BACK_BUTTON,
    TRANSITION
}

type CloseModalFn = (reason: ModalManagerCloseReason) => boolean
type ModalInfo = {
    id: string,
    close: CloseModalFn;
}
const modalInfoList: ModalInfo[] = [];

const onOpenModal = (modalInfo: ModalInfo) => {
    if (history.state != STATE_MODAL_OPENED) history.pushState(STATE_MODAL_OPENED,document.title);
    modalInfoList.push(modalInfo)
}
const onClosedModalByButton = (id: string) => {
    const index = modalInfoList.findIndex((it) => it.id == id);
    modalInfoList.splice(index,1);
    if (modalInfoList.length === 0 && history.state === STATE_MODAL_OPENED) history.back();
}
const onHistoryBack = (ev) => {
    if (history.state === STATE_MODAL_OPENED || !modalInfoList.length) return;
    const lastIndex = modalInfoList.length-1;
    const lastModal = modalInfoList[lastIndex];
    const isClosed = lastModal.close(ModalManagerCloseReason.BACK_BUTTON);
    if (isClosed) modalInfoList.pop()
    if (modalInfoList.length) history.pushState(STATE_MODAL_OPENED,document.title);
}
const closeTopModal = () => {
    if (modalInfoList.length === 0) return;
    const lastIndex = modalInfoList.length-1;
    const lastModal = modalInfoList[lastIndex];
    const isClosed = lastModal.close(ModalManagerCloseReason.BACK_BUTTON);
    if (isClosed) onClosedModalByButton(lastModal.id);
}
const onTransition = () => {
    modalInfoList.reverse().forEach(it => it.close(ModalManagerCloseReason.TRANSITION));
    modalInfoList.length = 0;
    if (history.state === STATE_MODAL_OPENED) {
        history.back();
        return new Promise<boolean>((s,j) => {
            window.addEventListener("popstate",() => s(true), {once: true})
        })
    }
    return true;
}
const isModalOpened = (id: string) => {
    return modalInfoList.find(it => it.id === id) != null
}

window.addEventListener("popstate", onHistoryBack)

export const modalManager = {
    onOpenModal, onClosedModalByButton, onTransition, isModalOpened, closeTopModal
}