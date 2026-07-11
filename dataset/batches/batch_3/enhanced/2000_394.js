setcpm(100/4)

$: s("sine linndrum_sd").lpf(1800).lpq(1.4225).distort("5:.3").room(.8).gain(0.3)

$: s("snare 2").clip(1).cutoff(500).resonance(14).gain(0.4)

$: s("rd*3 gm_electric_bass_pick:7").speed(1.6075).gain(1)

$: s("cp hh").gain(.2)
