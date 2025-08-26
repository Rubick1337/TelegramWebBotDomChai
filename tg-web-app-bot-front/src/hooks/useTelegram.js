const tg = window.Telegram.WebApp;

export function  useTelegram () {
    const onClose = ()=> {
        tg.close()
    }

    const colorScheme = tg?.colorScheme;
    const themeParams = tg?.themeParams || {};

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
        colorScheme,
        themeParams,
        isDark: colorScheme === 'dark',
        textColor: themeParams.text_color || (colorScheme === 'dark' ? '#ffffff' : '#000000'),
        bgColor: themeParams.bg_color || (colorScheme === 'dark' ? '#212121' : '#ffffff'),
    }
}