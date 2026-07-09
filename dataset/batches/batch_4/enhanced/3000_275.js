setcpm(31)

$: note("e3 c3@2").s("pulse gm_electric_bass_pick linndrum_hh sine 32 64 linndrum_oh bd:0 bd:1 bd:2 bd:3 gm_overdriven_guitar:3 ocarina mt lt ht hh").clip(1).lpf(5000)

$: note("g5 c6 g5 d5 g5 b5").s("piano gm_distortion_guitar:2").gain(.15).release(.4)

$: s("cymbal ~").gain(1)

$: n("5 1 2 4 ~").clip(1).release(.1)
