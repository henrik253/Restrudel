setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("oh ~").fast("<2 4>").gain("[.2 .8@3]*2").shape(.4).decay(.08).sustain(.2)

$: s("gm_synth_strings_1 ~").note("<c3 g2>").lpf(1200).room(.5).gain(.3)

$: n("0 3 5 7").scale("c:minor").s("sawtooth").lpf(700).release(.2).gain(.4)
