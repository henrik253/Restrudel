setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("c5 d5 e5 g5").sound("supersaw triangle").lpf(700).gain(.5)

$: n("c2 f2 g2 f2 g2 f2 ~ -1 -1 0 ~ 0 0 0 ~ 0 0 0 ~ 0 0 0 ~ 0 0").velocity(.0723).pan("<.4 .6>/10").lpf(1500).gain(.4)

$: s("cowbell ~").gain(.5)
