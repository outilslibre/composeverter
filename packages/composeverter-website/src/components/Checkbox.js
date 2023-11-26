export default ({ label, value, onChange, style }) => {
    return (
        <label style={style}>
            <input type="checkbox" checked={value} onChange={onChange} />
            {label}
        </label>
    );
};
