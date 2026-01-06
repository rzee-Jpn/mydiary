#translateBar {
  position: fixed;
  top: 12px;
  right: 14px;
  z-index: 9999;
}

#translateBar select {
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 8px;
  border: none;
  background: rgba(0,0,0,.7);
  color: #fff;
}

body.theme-paper #translateBar select {
  background: rgba(120,90,60,.85);
}

.tts-active {
  background: rgba(255, 230, 150, 0.4);
  border-radius: 4px;
  transition: background .3s;
}