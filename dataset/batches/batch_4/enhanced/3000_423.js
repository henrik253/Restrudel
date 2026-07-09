setcpm(120/4)

$: s("gm_drawbar_organ bass").gain("<0.4 0.45 0.5 0.6>")

$: note("d2*8 A4 Bb4 A4 Bb3 D3 E3 F3 c2 c2 c2 c2 c2 c2 c2 c2").sound("sawtooth bd*2").lpf(4121).room(.7483).s("sawtooth")
