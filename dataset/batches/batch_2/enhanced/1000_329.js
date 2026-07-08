setcpm(120/4)

$: s("perc*3 hh*4").gain(.5).segment(16).slow(2)

$: s("gm_oboe").gain(.4)

$: s("gm_distortion_guitar shaker_small:0").lpf(600).hpf(7000).gain(.35)

$: n("1 2*3").scale("c:minor").clip(.95).gain(.3)
