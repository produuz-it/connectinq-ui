# Changelog

## 0.1.1

- ModalDialog marks its shape as `cq-dialog--center`, `--side`, `--sheet` or `--full`, and
  PopButton its phone sheet as `pop-panel--sheet`. The bare `center`, `side`, `sheet` and `full`
  classes met the apps' own classes of the same name (an app's `.center` centred a dialog's text).
- A dialog no longer inherits text alignment, caps, tracking or weight from where it is mounted.
- Two branches, `test` and `main`: the fronts' test builds install `#test`, their production
  builds `#main`.

## 0.1.0

- First version: tokens, base styles, ModalDialog, PopButton, AppSwitcher (entries with a logo
  or a glyph), ToastMessage, TestTag, display helpers.
