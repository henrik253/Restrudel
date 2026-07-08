setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: n("3 0@3 ~ -7 0 1 2 3 4 -3 -2 -1 0 -7 -1 -3 ~ -4 ~ -5 ~ -6 -5 -7@3 ~ 0 1 2 3 -4 -3 -2").scale("a3:minor").s("recorder_bass_sus anvil").gain(.15).release(.4252).lpf(1500).gain(.4)

$: s("bass sd*3").slow(3.5973).gain(.5)
