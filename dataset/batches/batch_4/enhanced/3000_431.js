setcpm(120/4)

$: s("hh 4 8 6").slow(2)

$: s("pulse gm_pad_bowed:1").slow(32)

$: s("recorder_bass_sus cymbal").gain(.5).slow(2)

$: note("f6 d6 b5 ~").lpf(2793).s("sawtooth")
