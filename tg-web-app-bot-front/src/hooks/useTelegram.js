const tg = window.Telegram.WebApp;

export function  useTelegram () {
    const onClose = ()=> {
        tg.close()
    }

    const onToogleButton = () => {
        if (tg.MainButton.isVisible){
            tg.MainButton.hide();
        }
        else
        {
            tg.MainButton.show();
        }
    }
    return {
        tg,
        user: tg.initDataUnsafe?.user,
        onClose,
        onToogleButton,
        queryId: tg.initDataUnsafe?.query_id,
    }


}