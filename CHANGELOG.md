# Changelog

## 0.2.0

- The frame: `AppLayout` (the menu on the left, a top bar and a drawer on a phone, the tabs strip
  of the open section), `SideMenu` (sections and their screens as groups that open and close,
  a rail of icons when folded, a drawer with tall rows on a phone, links at the foot) and
  `AccountMenu` (the avatar, the name and a badge; a panel with who is signed in, the front's own
  blocks, the language and the sign-out). The data and the texts come from the front
  (`connectinq-ui/frame`: `FrameSection`, `FrameEntry`, `FrameTab`, `useFolded`, `useFrame`).

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
