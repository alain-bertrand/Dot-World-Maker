class ChangePassword {

    public static Dispose() {

    }

    public static IsAccessible() {
        return (("" + document.location).indexOf("/maker.html") != -1 || Main.CheckNW());
    }

    public static Recover() {

    }

    public static ChangePassword() {
        var currentPass = $('#current_password').val().trim();
        var newPass = $('#new_password').val().trim();
        var passConfirm = $('#password_confirm').val().trim();

        if(!currentPass) {
            Framework.Alert('You must enter your current password', ChangePassword.ClearFields);
        }
        else if(newPass !== passConfirm || !newPass.length || !passConfirm.length) {
            Framework.Alert('Your new passwords do not match', ChangePassword.ClearFields);
        }
        else {
            if(currentPass === newPass) {
                Framework.Alert('Your new password should differ from your old password', ChangePassword.ClearFields);
            }
            else {
                $.ajax({
                    type: 'POST',
                    url: '/backend/ChangePassword',
                    data: {
                        token: framework.Preferences['token'],
                        currentPass: currentPass,
                        newPass: newPass
                    },
                    success: function (message) {
                        var resultMessage = JSON.parse(message);
                        Framework.Alert(resultMessage.success, ChangePassword.ClearFields);
                    },
                    error: function (message) {
                        var resultMessage = JSON.parse(message);
                        Framework.Alert(resultMessage.error, ChangePassword.ClearFields);
                    }

                })
            }
        }

    }

    private static ClearFields() {
        $('#current_password').val('');
        $('#new_password').val('');
        $('#password_confirm').val('');
    }
}
