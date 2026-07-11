setcpm(130/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[0.8 0.4]*8").decay(.0769).sustain(0).degradeBy(.4)

$: n("0 3 5 7").scale("c:minor").s("gm_piano").gain(.5).cutoff(1200).decay(.16).sustain(0).room(.4).delay(.3)

$: s("~ snare").gain(.4)
