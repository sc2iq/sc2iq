import React from "react"
import Search from "./Search"
import Tags from "./Tags"
import styles from "./TestLevel.module.css"

export enum TestLevel {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
    Brutal = 'Brutal',
    Custom = 'Custom',
}

type Props = {
    testLevel: TestLevel
}

const TestLevelComponent: React.FC<Props> = (props) => {
    const [tags, setTags] = React.useState<string[]>([])
    const [minDifficulty, setMinDifficulty] = React.useState(1)
    const [maxDifficulty, setMaxDifficulty] = React.useState(10)

    const onChangeMinDifficulty = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (value < maxDifficulty) {
            setMinDifficulty(value)
        }
    }

    const onChangeMaxDifficulty = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (value > minDifficulty) {
            setMaxDifficulty(value)
        }
    }

    if (props.testLevel === TestLevel.Easy) {
        return (
            <div className="center">
                <span>Difficulty 1 - 3</span>
            </div>
        )
    }

    if (props.testLevel === TestLevel.Medium) {
        return (
            <div className="center">
                <span>Difficulty 2 - 5</span>
            </div>
        )
    }

    if (props.testLevel === TestLevel.Hard) {
        return (
            <div className="center">
                <span>Difficulty 5 - 8</span>
            </div>
        )
    }

    if (props.testLevel === TestLevel.Brutal) {
        return (
            <div className="center">
                <span>Difficulty 8 - 10</span>
            </div>
        )
    }

    return (
        <div>
            <p>Configure settings to test a certain set questions.</p>
            <div className={styles.fields}>
                <div>Includes Tags:</div>
                <Tags tags={tags} setTags={setTags} />
                <div>Difficulty Range: </div>
                <div className={styles.difficulty}>
                    <div>
                        <span>1</span><span>{minDifficulty} &lt;= Question Difficulty &lt;= {maxDifficulty}</span><span>10</span>
                    </div>
                    <input type="range" value={minDifficulty} onChange={onChangeMinDifficulty} min={1} max={10} />
                    <input type="range" value={maxDifficulty} onChange={onChangeMaxDifficulty} min={1} max={10} />
                </div>
            </div>
        </div>
    )
}

type Props2 = {
    testLevel: TestLevel
    onChange: (testLevel: TestLevel) => void
}

const TestLevelContainer: React.FC<Props2> = (props) => {
    const onChangeTestLevel = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const testLevel = event.target.value as TestLevel
        props.onChange(testLevel)
    }

    return (
        <>
            <div className={"center"}>
                <select
                    value={props.testLevel}
                    className={styles.testLevelDropdown}
                    onChange={onChangeTestLevel}
                >
                    <option value={TestLevel.Easy}>{TestLevel.Easy}</option>
                    <option value={TestLevel.Medium}>{TestLevel.Medium}</option>
                    <option value={TestLevel.Hard}>{TestLevel.Hard}</option>
                    <option value={TestLevel.Brutal}>{TestLevel.Brutal}</option>
                    <option value={TestLevel.Custom}>{TestLevel.Custom}</option>
                </select>
            </div>
            <TestLevelComponent testLevel={props.testLevel} />
        </>
    )
}

export default TestLevelContainer