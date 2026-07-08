setcpm(104/4)

$: s("bd ~").slow(2).gain(.8)

$: s("sd*3").gain("[1 0.4]*4").delay(.25).delaytime(.1).delayfeedback(.4)

$: s("recorder_bass_sus").n("0 3").gain(.4)

$: s("gm_synth_strings_1").note("<c3 g2>").slow(2).gain(.3)
