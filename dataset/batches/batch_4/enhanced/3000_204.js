setcpm(100)

$: n("F4 Ab3 B3 F4 ~ G3").s("gm_overdriven_guitar:3 cp*8 rd*3 sd*4").gain(.6).hpf(1000).lpf(3000)

$: s("hh*2 cp").clip(.8092).gain("0.25 0.35 0.3 0.4")

$: sound("drum triangle").lpf(249).room(.25).bank("RolandTR909").gain(.8)

$: s("gm_distortion_guitar gm_bassoon gm_acoustic_bass gm_electric_bass_pick:7").lpf(600).gain(.9)
