setcpm(100/4)

$: s("bd*2 ~").bank("RolandTR808").gain(.7)

$: note("c4 e4").sound("bd*2 ~").lpf(2000).resonance(5).delay(.2).gain(.4)

$: s("gm_distortion_guitar bell").slow(4).gain(.3)

$: s("gm_distortion_guitar cr").transpose("<0 1 2 1>/8").attack(.1).slow(2).gain(.3)
