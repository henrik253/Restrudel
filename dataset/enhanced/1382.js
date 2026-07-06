setcpm(122/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("[~ oh]*4").gain("[.25 .18]*4").room(.5).delay(.28).delaytime(.08).delayfeedback(.4)

$: s("~ cp clave sd").gain(.5)

$: n("<0 ~ 4 [3 2]>").scale("g:dorian").s("gm_flute").attack(.08).release(.5).gain(.3).delay(.3)

$: note("g1 g1 ~ g1 ~ f1 ~ ~").s("sawtooth").lpf(500).release(.12).gain(.5)
