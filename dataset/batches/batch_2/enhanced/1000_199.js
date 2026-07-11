setcpm(90/4)

$: s("gm_harmonica ~ 64 ~").gain(.3).cutoff(400).attack(.05)

$: s("~ hh ~ hh").gain(.2)

$: note("c3 d3 c3 d3").sound("gm_pad_bowed").delay(.5).decay(.1).sustain(1).room(.3).gain(.3)

$: note("c d e d").sound("gm_lead_6_voice").room(.2).gain(.3)
