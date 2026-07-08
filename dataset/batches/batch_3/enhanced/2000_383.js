setcpm(100/4)

$: note("a2*8 ~ ~ a2*8").scale("c2:minor").sound("sawtooth ~").lpf(1425).gain(.843).room(.1).delay(.2564)

$: s("piano gm_epiano1:2 white*4 folkharp").gain(.8).release(.12)

$: s("recorder_bass_sus sd@3").gain(.35)

$: s("kick snare").gain(.4)
