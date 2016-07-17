<toolbar>
  <div class="container">
    <div class="file-section section">
      <label class="file"><span class="icon">&#xe63a;</span><input type="file" accept=".mid,.midi" onchange={onChangeFile}></input></label>
      <button onclick={onClickSave}><span class="icon">&#xe63c;</span></button>
    </div>

    <div class="song-section section">
      <p class="song-name">{songName}</p>
      <p class="tempo">BPM {tempo}</p>
    </div>

    <div class="transport-section section">
      <button onclick={onClickBackward}><span class="icon">&#xe606;</span></button>
      <button onclick={onClickStop}><span class="icon">&#xe615;</span></button>
      <button onclick={onClickPlay}><span class="icon">&#xe616;</span></button>
      <button onclick={onClickForward}><span class="icon">&#xe607;</span></button>
    </div>

    <div class="tool-section section">
      <button onclick={onClickPencil}>✎</button>
      <button onclick={onClickSelection}>□</button>
    </div>

    <button onclick={onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png"></button>
    <button onclick={onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png"></button>
    <button onclick={onClickAutoScroll}>Auto Scroll</button>

    <riot-select name="trackSelect" onselect={onSelectTrack}></riot-select>
    <riot-select name="quantizeSelect" onselect={onSelectQuantize}></riot-select>
  </div>

  <script type="text/javascript">
    "use strict"

    this.on("mount", () => {
      this.quantizeSelect._tag.update({options: quantizeOptions})

      this.tempo = SharedService.player.currentTempo
      SharedService.player.on("change-tempo", tempo => {
        this.update({tempo: tempo})
      })
    })

    this.on("update", () => {
      if (!this.song) {
        return
      }

      const trackOptions = this.song.getTracks().map((t, i) => { return {
        name: `${i}. ${t.name || ""}`,
        value: i,
        selected: i == 0
      }})
      this.trackSelect._tag.update({options: trackOptions})

      this.songName = this.song.name
    })
    const quantizeOptions = [
      {
        name: "全音符",
        value: 1,
      },
      {
        name: "付点2分音符",
        value: 2 / 1.5,
      },
      {
        name: "2分音符",
        value: 2,
      },
      {
        name: "3連2分音符",
        value: 3,
      },
      {
        name: "付点4分音符",
        value: 4 / 1.5
      },
      {
        name: "4分音符",
        value: 4,
        selected: true
      },
      {
        name: "3連4分音符",
        value: 6,
      },
      {
        name: "付点8分音符",
        value: 8 / 1.5
      },
      {
        name: "8分音符",
        value: 8
      },
      {
        name: "3連8分音符",
        value: 12,
      },
      {
        name: "付点16分音符",
        value: 16 / 1.5
      },
      {
        name: "16分音符",
        value: 16
      },
      {
        name: "3連16分音符",
        value: 24,
      },
      {
        name: "付点32分音符",
        value: 32 / 1.5
      },
      {
        name: "32分音符",
        value: 32
      },
      {
        name: "3連16分音符",
        value: 48,
      },
      ]
  </script>
  <style scoped>
    .file input[type="file"] {
      display: none;
    }

    .icon {
      font-family: "Flat-UI-Icons";
      font-weight: normal;
    }

    > .container {
      height: var(--header-height);
      box-sizing: border-box;
      border-bottom: 1px solid rgb(204, 204, 204);
      background: rgb(249, 249, 249);
    }

    button:hover, .file:hover {
      opacity: 0.5;
    }

    button, .file {
      min-width: 3em;
      padding: 0 0.5em;
      -webkit-appearance: none;
      background: rgba(0, 0, 0, 0);
      border: none;
      display: inline-block;
      cursor: pointer;
      text-align: center;
      font-size: 110%;
      height: 100%;
    }
      
    riot-select {
      height: 1.8em;
      display: inline-block;
    }

    .section {
      float: left;
      border-right: 1px solid rgb(212, 212, 212);
      margin-right: 1em;
      height: 100%;
      padding-right: 1em;
    }

    .section>p {
      float: left;
    }

    .song-name {
      margin-right: 1em;
      max-width: 10em;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .tempo {
      color: rgb(162, 162, 162);
    }
  </style>
</toolbar>